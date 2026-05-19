/**
 * ============================================================================
 * DUBAI DUST — Ultra-Luxury Order Webhook Handler
 * ============================================================================
 *
 * Listens for Shopify order/create webhooks, detects ultra-luxury items,
 * and triggers a personalised handwritten-style thank-you email.
 *
 * Supports: SendGrid, Mailgun, Postmark (configurable via EMAIL_PROVIDER env).
 *
 * Deployment options:
 *   • Node.js server (Express)
 *   • Vercel / Netlify serverless function
 *   • AWS Lambda behind API Gateway
 *
 * Usage:
 *   EMAIL_PROVIDER=sendgrid \
 *   EMAIL_API_KEY=SG.xxxxx \
 *   EMAIL_FROM="Dubai Dust Concierge <concierge@dubaidust.co.za>" \
 *   SHOPIFY_WEBHOOK_SECRET=your_webhook_secret \
 *   SHOP_URL=https://dubaidust.co.za \
 *   node order-webhook-handler.js
 *
 * ============================================================================
 */

'use strict';

// ─── Dependencies ──────────────────────────────────────────────────────────────
const express = require('express');
const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');

// ─── Configuration ─────────────────────────────────────────────────────────────
const PORT                   = process.env.PORT || 3500;
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';
const EMAIL_PROVIDER         = (process.env.EMAIL_PROVIDER || 'sendgrid').toLowerCase();
const EMAIL_API_KEY          = process.env.EMAIL_API_KEY || '';
const EMAIL_FROM             = process.env.EMAIL_FROM || 'Dubai Dust Concierge <concierge@dubaidust.co.za>';
const SHOP_URL               = process.env.SHOP_URL || 'https://dubaidust.co.za';

// Ultra-luxury detection criteria
const ULTRA_LUXURY_TAGS        = ['ultra-luxury', 'ultra luxury', 'vip', 'ultra-luxury-collection'];
const ULTRA_LUXURY_COLLECTIONS = ['ultra-luxury'];
const ULTRA_LUXURY_MIN_PRICE   = null; // set e.g. 800 to also flag items above a price threshold (ZAR)

// ─── Logger ────────────────────────────────────────────────────────────────────
const log = {
  info:  (msg, data) => console.log(`[INFO]  ${new Date().toISOString()} — ${msg}`, data || ''),
  warn:  (msg, data) => console.warn(`[WARN]  ${new Date().toISOString()} — ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${new Date().toISOString()} — ${msg}`, data || ''),
};

// ─── Express App ───────────────────────────────────────────────────────────────
const app = express();

// Shopify sends JSON with HMAC verification — we need the raw body
app.use('/webhooks/orders/create', express.raw({ type: 'application/json' }));
app.use(express.json()); // for other routes

// ─── HMAC Verification Middleware ──────────────────────────────────────────────
function verifyShopifyWebhook(req, res, next) {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    log.warn('SHOPIFY_WEBHOOK_SECRET not set — skipping HMAC verification (dev mode)');
    // Parse raw body to JSON for downstream handlers
    try { req.body = JSON.parse(req.body); } catch (_) { /* already parsed */ }
    return next();
  }

  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  if (!hmacHeader) {
    log.warn('Missing X-Shopify-Hmac-Sha256 header');
    return res.status(401).json({ error: 'Unauthorized — missing HMAC header' });
  }

  const rawBody = typeof req.body === 'string' ? req.body : req.body.toString('utf8');
  const computedHmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  if (!crypto.timingSafeEqual(Buffer.from(computedHmac), Buffer.from(hmacHeader))) {
    log.warn('HMAC verification failed');
    return res.status(401).json({ error: 'Unauthorized — HMAC mismatch' });
  }

  try { req.body = JSON.parse(rawBody); } catch (_) { /* already parsed */ }
  next();
}

// ─── Ultra-Luxury Detection ────────────────────────────────────────────────────

/**
 * Determines whether an individual line item qualifies as ultra-luxury.
 * Checks product tags, vendor, collection info, and price threshold.
 */
function isUltraLuxuryItem(item) {
  // 1. Check product tags (Shopify sends tags as comma-separated string on the order)
  const tags = (item.tags || item.product_tags || '').toLowerCase().split(',').map(t => t.trim());
  if (tags.some(tag => ULTRA_LUXURY_TAGS.includes(tag))) return true;

  // 2. Check product properties / custom attributes
  const properties = item.properties || [];
  const hasUltraProperty = properties.some(p =>
    (p.name || '').toLowerCase().includes('ultra-luxury') ||
    (p.value || '').toLowerCase().includes('ultra-luxury')
  );
  if (hasUltraProperty) return true;

  // 3. Check SKU prefix convention (e.g., UL-xxxx)
  if (item.sku && item.sku.toUpperCase().startsWith('UL-')) return true;

  // 4. Check product title / variant title for "ultra luxury" keyword
  const titleCheck = `${item.title || ''} ${item.variant_title || ''}`.toLowerCase();
  if (titleCheck.includes('ultra luxury') || titleCheck.includes('ultra-luxury')) return true;

  // 5. Check product type
  if (item.product_type && item.product_type.toLowerCase().includes('ultra-luxury')) return true;

  // 6. Optional price threshold
  if (ULTRA_LUXURY_MIN_PRICE && parseFloat(item.price) >= ULTRA_LUXURY_MIN_PRICE) return true;

  return false;
}

/**
 * Filters ultra-luxury items from the full order line_items array.
 * Also attempts tag-level detection from the order's top-level `tags` field.
 */
function getUltraLuxuryItems(order) {
  const lineItems = order.line_items || [];

  // If the whole order is tagged ultra-luxury, treat all items as qualifying
  const orderTags = (order.tags || '').toLowerCase().split(',').map(t => t.trim());
  const orderIsUltra = orderTags.some(tag => ULTRA_LUXURY_TAGS.includes(tag));

  if (orderIsUltra) {
    log.info('Entire order tagged as ultra-luxury', { orderId: order.id });
    return lineItems;
  }

  return lineItems.filter(item => isUltraLuxuryItem(item));
}

// ─── Email Template Rendering ──────────────────────────────────────────────────

/**
 * Loads the HTML template and replaces Handlebars-style placeholders.
 */
function renderEmailTemplate(order, ultraLuxuryItems) {
  const templatePath = path.join(__dirname, '..', 'email-templates', 'ultra-luxury-thankyou.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  const customer = order.customer || {};
  const firstName = customer.first_name || order.billing_address?.first_name || 'Valued Client';
  const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Build item rows HTML
  const itemRowsHtml = ultraLuxuryItems.map(item => {
    const variant = item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '';
    const price = `R${parseFloat(item.price).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-bottom: 1px solid rgba(212, 175, 55, 0.08);">
        <tr>
          <td style="padding: 12px 0; vertical-align: top; width: 70%;">
            <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; font-weight: 600; color: #e8e0d4; margin: 0 0 4px;">${escapeHtml(item.title)}</p>
            ${variant ? `<p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #9a9080; letter-spacing: 1px; margin: 0;">${escapeHtml(variant)}</p>` : ''}
          </td>
          <td style="padding: 12px 0; vertical-align: top; width: 30%; text-align: right;">
            <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #D4AF37; margin: 0;">${price}</p>
            <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #9a9080; margin: 4px 0 0;">Qty: ${item.quantity}</p>
          </td>
        </tr>
      </table>`;
  }).join('');

  // Calculate total for ultra-luxury items only
  const ultraTotal = ultraLuxuryItems.reduce((sum, item) =>
    sum + (parseFloat(item.price) * (item.quantity || 1)), 0
  );
  const totalFormatted = `R${ultraTotal.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;

  // Replace template placeholders
  html = html.replace(/\{\{customer_first_name\}\}/g, escapeHtml(firstName));
  html = html.replace(/\{\{order_name\}\}/g, escapeHtml(order.name || `#${order.order_number}`));
  html = html.replace(/\{\{order_date\}\}/g, orderDate);
  html = html.replace(/\{\{order_total\}\}/g, totalFormatted);
  html = html.replace(/\{\{shop_url\}\}/g, SHOP_URL);
  html = html.replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString());

  // Replace the item block (between {{#each}} and {{/each}}) with rendered items
  html = html.replace(
    /<!--\s*\{\{#each order_items\}\}\s*-->[\s\S]*?<!--\s*\{\{\/each\}\}\s*-->/,
    itemRowsHtml
  );

  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Email Sending (Multi-Provider) ────────────────────────────────────────────

/**
 * Send the email via the configured provider.
 * Returns a promise that resolves on success.
 */
async function sendEmail(to, subject, htmlBody) {
  switch (EMAIL_PROVIDER) {
    case 'sendgrid':   return sendViaSendGrid(to, subject, htmlBody);
    case 'mailgun':    return sendViaMailgun(to, subject, htmlBody);
    case 'postmark':   return sendViaPostmark(to, subject, htmlBody);
    default:
      throw new Error(`Unsupported EMAIL_PROVIDER: ${EMAIL_PROVIDER}`);
  }
}

// ── SendGrid ──
async function sendViaSendGrid(to, subject, htmlBody) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAIL_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from:    parseEmailAddress(EMAIL_FROM),
      subject: subject,
      content: [{ type: 'text/html', value: htmlBody }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`SendGrid error ${response.status}: ${errBody}`);
  }
  log.info('Email sent via SendGrid', { to });
}

// ── Mailgun ──
async function sendViaMailgun(to, subject, htmlBody) {
  const fetch = (await import('node-fetch')).default;
  const domain = process.env.MAILGUN_DOMAIN || 'mg.dubaidust.co.za';
  const formData = new URLSearchParams();
  formData.append('from', EMAIL_FROM);
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('html', htmlBody);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${EMAIL_API_KEY}`).toString('base64')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Mailgun error ${response.status}: ${errBody}`);
  }
  log.info('Email sent via Mailgun', { to });
}

// ── Postmark ──
async function sendViaPostmark(to, subject, htmlBody) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': EMAIL_API_KEY,
      'Content-Type':            'application/json',
      'Accept':                  'application/json',
    },
    body: JSON.stringify({
      From:     EMAIL_FROM,
      To:       to,
      Subject:  subject,
      HtmlBody: htmlBody,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Postmark error ${response.status}: ${errBody}`);
  }
  log.info('Email sent via Postmark', { to });
}

function parseEmailAddress(fromStr) {
  const match = fromStr.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { email: fromStr.trim() };
}

// ─── Webhook Route ─────────────────────────────────────────────────────────────
app.post('/webhooks/orders/create', verifyShopifyWebhook, async (req, res) => {
  const order = req.body;

  // Immediately respond 200 to Shopify (they retry on non-2xx)
  res.status(200).json({ received: true });

  try {
    log.info('Order received', {
      orderId:     order.id,
      orderName:   order.name,
      email:       order.email,
      itemCount:   (order.line_items || []).length,
    });

    // Detect ultra-luxury items
    const ultraLuxuryItems = getUltraLuxuryItems(order);

    if (ultraLuxuryItems.length === 0) {
      log.info('No ultra-luxury items detected — skipping thank-you email', {
        orderId: order.id,
      });
      return;
    }

    log.info(`Found ${ultraLuxuryItems.length} ultra-luxury item(s)`, {
      orderId: order.id,
      items:   ultraLuxuryItems.map(i => i.title),
    });

    // Check for customer email
    const customerEmail = order.email || order.customer?.email;
    if (!customerEmail) {
      log.warn('No customer email found — cannot send thank-you', { orderId: order.id });
      return;
    }

    // Render and send
    const htmlBody = renderEmailTemplate(order, ultraLuxuryItems);
    const firstName = order.customer?.first_name || 'Valued Client';
    const subject = `Thank you for your exquisite choice, ${firstName} ✦ Dubai Dust`;

    await sendEmail(customerEmail, subject, htmlBody);

    log.info('Ultra-luxury thank-you email sent successfully', {
      orderId: order.id,
      to:      customerEmail,
      items:   ultraLuxuryItems.length,
    });
  } catch (err) {
    log.error('Failed to process order webhook', {
      orderId: order.id,
      error:   err.message,
      stack:   err.stack,
    });
  }
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    service:  'dubai-dust-ultra-luxury-email',
    provider: EMAIL_PROVIDER,
    uptime:   process.uptime(),
  });
});

// ─── Test Endpoint (dev only) ──────────────────────────────────────────────────
app.post('/test/send-email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Test endpoint disabled in production' });
  }

  const mockOrder = {
    id: 'test-001',
    name: '#DD-TEST-001',
    order_number: 'TEST-001',
    email: req.body.email || 'test@example.com',
    created_at: new Date().toISOString(),
    tags: 'ultra-luxury',
    total_price: '12997.00',
    customer: {
      first_name: req.body.first_name || 'Aaliyah',
      last_name:  req.body.last_name  || 'Van Der Merwe',
      email:      req.body.email      || 'test@example.com',
    },
    line_items: [
      {
        title: 'La Mer Moisturizing Cream',
        variant_title: '60ml',
        price: '5999.00',
        quantity: 1,
        tags: 'ultra-luxury',
        sku: 'UL-LAMER-001',
      },
      {
        title: 'Swarovski Millenia Necklace',
        variant_title: 'Rose Gold',
        price: '7999.00',
        quantity: 1,
        tags: 'ultra-luxury',
        sku: 'UL-SWAR-002',
      },
    ],
  };

  try {
    const ultraLuxuryItems = getUltraLuxuryItems(mockOrder);
    const html = renderEmailTemplate(mockOrder, ultraLuxuryItems);

    if (req.body.preview) {
      return res.type('html').send(html);
    }

    await sendEmail(mockOrder.email, `Thank you for your exquisite choice, ${mockOrder.customer.first_name} ✦ Dubai Dust`, html);
    res.json({ success: true, message: 'Test email sent', to: mockOrder.email });
  } catch (err) {
    log.error('Test email failed', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  log.info(`Dubai Dust Webhook Handler running on port ${PORT}`);
  log.info(`Email provider: ${EMAIL_PROVIDER}`);
  log.info(`Webhook endpoint: POST /webhooks/orders/create`);
  log.info(`Health check:     GET  /health`);
  if (process.env.NODE_ENV !== 'production') {
    log.info(`Test endpoint:    POST /test/send-email`);
  }
});

module.exports = app; // for testing
