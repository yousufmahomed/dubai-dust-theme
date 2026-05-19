# Dubai Dust — Ultra-Luxury Thank-You Email System

> Automated handwritten-style thank-you emails for ultra-luxury orders.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Approach A — Shopify Flow (Shopify Plus)](#approach-a--shopify-flow-shopify-plus)
4. [Approach B — External Webhook Endpoint](#approach-b--external-webhook-endpoint)
5. [Email Service Configuration](#email-service-configuration)
6. [Environment Variables](#environment-variables)
7. [Shopify Webhook Configuration](#shopify-webhook-configuration)
8. [Testing Procedures](#testing-procedures)
9. [Ultra-Luxury Detection Logic](#ultra-luxury-detection-logic)
10. [Troubleshooting](#troubleshooting)

---

## Overview

When a customer purchases an ultra-luxury item from Dubai Dust, they automatically receive a personalised handwritten-style thank-you email. The email:

- Uses an elegant **Dancing Script** font for a handwritten aesthetic
- Features the Dubai Dust dark-and-gold luxury branding
- Personalises the greeting with the customer's first name
- Lists the specific ultra-luxury items purchased
- Reinforces the exclusivity and refinement of their choice
- Is signed by **The Dubai Dust Concierge Team**

### File Structure

```
dubai-dust-theme/
├── email-templates/
│   ├── ultra-luxury-thankyou.html   ← HTML email template
│   └── EMAIL_SETUP.md              ← This documentation
└── webhooks/
    └── order-webhook-handler.js     ← Express webhook server
```

---

## Architecture

```
┌──────────────┐     webhook POST      ┌───────────────────────┐
│   Shopify    │ ───────────────────▶   │  order-webhook-handler│
│  Order Event │  /webhooks/orders/     │  (Node.js / Express)  │
└──────────────┘     create             └───────────┬───────────┘
                                                    │
                                        1. Verify HMAC signature
                                        2. Parse order line items
                                        3. Detect ultra-luxury items
                                        4. Render email template
                                                    │
                                                    ▼
                                        ┌───────────────────────┐
                                        │  Email Service API    │
                                        │  (SendGrid / Mailgun  │
                                        │   / Postmark)         │
                                        └───────────────────────┘
                                                    │
                                                    ▼
                                        ┌───────────────────────┐
                                        │  Customer Inbox       │
                                        │  📧 Thank-you email   │
                                        └───────────────────────┘
```

---

## Approach A — Shopify Flow (Shopify Plus)

> **Requires:** Shopify Plus plan

Shopify Flow is the simplest approach — no external server needed.

### Step 1: Create the Flow

1. Go to **Shopify Admin → Apps → Shopify Flow**
2. Click **Create workflow**
3. Select trigger: **Order created**

### Step 2: Add Condition

Add a condition to check for ultra-luxury products:

**Condition:** `For each` line item in the order:
- **Check:** `line_item.product.tags contains "ultra-luxury"`
- **OR:** `line_item.product.product_type contains "Ultra-Luxury"`

### Step 3: Add Action — Send HTTP Request

If using an external email service:

- **Action:** Send HTTP request
- **URL:** `https://api.sendgrid.com/v3/mail/send`
- **Method:** POST
- **Headers:**
  ```
  Authorization: Bearer YOUR_SENDGRID_API_KEY
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "personalizations": [{
      "to": [{ "email": "{{ order.email }}" }],
      "dynamic_template_data": {
        "customer_first_name": "{{ order.customer.firstName }}",
        "order_name": "{{ order.name }}",
        "order_total": "{{ order.totalPriceSet.shopMoney.amount }}"
      }
    }],
    "from": { "email": "concierge@dubaidust.co.za", "name": "Dubai Dust Concierge" },
    "template_id": "d-YOUR_SENDGRID_TEMPLATE_ID"
  }
  ```

### Step 4: Alternative — Use Shopify Flow Email Action

1. **Action:** Send internal email
2. **To:** `{{ order.email }}`
3. **Subject:** `Thank you for your exquisite choice, {{ order.customer.firstName }} ✦ Dubai Dust`
4. **Body:** Paste the HTML from `ultra-luxury-thankyou.html` (with Liquid variables)

### Step 5: Activate the Flow

1. Test with a mock order
2. Turn the workflow **ON**

---

## Approach B — External Webhook Endpoint

> **Works on any Shopify plan.** Requires a Node.js hosting environment.

### Step 1: Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
cd dubai-dust-theme/webhooks
npm init -y
npm install express node-fetch
```

### Step 2: Create `.env` File

```bash
# dubai-dust-theme/webhooks/.env

# ── Shopify ──
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret_here

# ── Email Provider (choose one: sendgrid | mailgun | postmark) ──
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Dubai Dust Concierge <concierge@dubaidust.co.za>

# ── Mailgun-specific (only if EMAIL_PROVIDER=mailgun) ──
MAILGUN_DOMAIN=mg.dubaidust.co.za

# ── App ──
PORT=3500
SHOP_URL=https://dubaidust.co.za
NODE_ENV=production
```

### Step 3: Deploy

#### Option A — Railway / Render / Fly.io (Recommended)

```bash
# Example: Railway
npm install -g @railway/cli
railway login
railway init
railway up
```

Set environment variables in the Railway dashboard.

#### Option B — Vercel Serverless

Wrap the handler as a Vercel serverless function:

```javascript
// api/webhooks/orders/create.js
const app = require('../../webhooks/order-webhook-handler');
module.exports = app;
```

#### Option C — AWS Lambda + API Gateway

Use a tool like `serverless` or `aws-cdk` to deploy:

```yaml
# serverless.yml
functions:
  orderWebhook:
    handler: webhooks/order-webhook-handler.handler
    events:
      - httpApi:
          path: /webhooks/orders/create
          method: post
```

#### Option D — DigitalOcean / VPS

```bash
# On your server
cd /opt/dubai-dust/webhooks
npm install
npm install -g pm2

# Start with PM2
pm2 start order-webhook-handler.js --name dubai-dust-emails
pm2 save
pm2 startup
```

### Step 4: Configure Shopify Webhook

See [Shopify Webhook Configuration](#shopify-webhook-configuration) below.

---

## Email Service Configuration

### SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key: **Settings → API Keys → Create API Key**
   - Permission: **Mail Send** (restricted access is sufficient)
3. Verify your sender identity: **Settings → Sender Authentication**
   - Authenticate domain `dubaidust.co.za` (recommended)
   - Or verify single sender `concierge@dubaidust.co.za`
4. Set env variables:
   ```
   EMAIL_PROVIDER=sendgrid
   EMAIL_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### Optional: SendGrid Dynamic Template

For easier template management:
1. Go to **Email API → Dynamic Templates**
2. Create a new template
3. Paste the HTML from `ultra-luxury-thankyou.html`
4. Replace placeholders with SendGrid Handlebars: `{{customer_first_name}}`, etc.
5. Note the **Template ID** (starts with `d-`)

---

### Mailgun

1. Sign up at [mailgun.com](https://www.mailgun.com)
2. Add your domain: **Sending → Domains → Add New Domain**
3. Verify DNS records (SPF, DKIM, MX)
4. Get your API key: **Settings → API Security**
5. Set env variables:
   ```
   EMAIL_PROVIDER=mailgun
   EMAIL_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MAILGUN_DOMAIN=mg.dubaidust.co.za
   ```

---

### Postmark

1. Sign up at [postmarkapp.com](https://postmarkapp.com)
2. Create a new server
3. Get the **Server API Token** from the server settings
4. Verify your sender signature
5. Set env variables:
   ```
   EMAIL_PROVIDER=postmark
   EMAIL_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SHOPIFY_WEBHOOK_SECRET` | Yes (prod) | — | Shopify webhook HMAC secret for verification |
| `EMAIL_PROVIDER` | Yes | `sendgrid` | Email service: `sendgrid`, `mailgun`, or `postmark` |
| `EMAIL_API_KEY` | Yes | — | API key for the chosen email provider |
| `EMAIL_FROM` | No | `Dubai Dust Concierge <concierge@dubaidust.co.za>` | Sender address |
| `MAILGUN_DOMAIN` | If Mailgun | `mg.dubaidust.co.za` | Mailgun sending domain |
| `SHOP_URL` | No | `https://dubaidust.co.za` | Store URL for email links |
| `PORT` | No | `3500` | HTTP server port |
| `NODE_ENV` | No | — | Set to `production` to disable test endpoints |

---

## Shopify Webhook Configuration

### Step-by-Step

1. Go to **Shopify Admin → Settings → Notifications**
2. Scroll down to **Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Event:** `Order creation`
   - **Format:** `JSON`
   - **URL:** `https://your-server.com/webhooks/orders/create`
   - **Webhook API version:** Latest stable (e.g., `2024-10`)
5. Click **Save**
6. **Copy the webhook secret** (shown once after saving) and set it as `SHOPIFY_WEBHOOK_SECRET`

### Via Shopify CLI / API

```bash
# Using Shopify CLI
shopify webhook create \
  --topic orders/create \
  --address https://your-server.com/webhooks/orders/create \
  --format json
```

```javascript
// Using Shopify Admin API
const webhook = await shopify.rest.Webhook.create({
  session,
  topic: 'orders/create',
  address: 'https://your-server.com/webhooks/orders/create',
  format: 'json',
});
```

---

## Testing Procedures

### 1. Preview Email Template (No Email Service Needed)

```bash
# Start the server in dev mode
cd dubai-dust-theme/webhooks
node order-webhook-handler.js

# Request an HTML preview
curl -X POST http://localhost:3500/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"preview": true, "first_name": "Aaliyah"}' \
  -o test-email-preview.html

# Open in browser
open test-email-preview.html
```

### 2. Send a Test Email

```bash
curl -X POST http://localhost:3500/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com",
    "first_name": "Aaliyah",
    "last_name": "Van Der Merwe"
  }'
```

### 3. Simulate a Shopify Webhook

```bash
curl -X POST http://localhost:3500/webhooks/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123456789,
    "name": "#DD-1042",
    "order_number": 1042,
    "email": "your-test-email@example.com",
    "created_at": "2026-05-19T12:00:00Z",
    "total_price": "12997.00",
    "tags": "",
    "customer": {
      "first_name": "Aaliyah",
      "last_name": "Van Der Merwe",
      "email": "your-test-email@example.com"
    },
    "line_items": [
      {
        "title": "La Mer Moisturizing Cream",
        "variant_title": "60ml",
        "price": "5999.00",
        "quantity": 1,
        "tags": "ultra-luxury, skincare",
        "sku": "UL-LAMER-001"
      },
      {
        "title": "Maybelline Fit Me Foundation",
        "variant_title": "220 Natural Beige",
        "price": "189.00",
        "quantity": 1,
        "tags": "standard, cosmetics",
        "sku": "STD-MAY-001"
      }
    ]
  }'
```

Expected result: Only the La Mer item triggers the thank-you email. The Maybelline item is filtered out.

### 4. Health Check

```bash
curl http://localhost:3500/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "dubai-dust-ultra-luxury-email",
  "provider": "sendgrid",
  "uptime": 42.123
}
```

### 5. Shopify Test Webhook

In Shopify Admin → Settings → Notifications → Webhooks:
- Click **Send test notification** next to your webhook
- Check server logs for the incoming request

### 6. End-to-End Test

1. Create a test product tagged `ultra-luxury` in Shopify
2. Place a test order with the Shopify Bogus Gateway
3. Verify the webhook fires and the email arrives

---

## Ultra-Luxury Detection Logic

The system identifies ultra-luxury items using multiple criteria (any match qualifies):

| Check | Example |
|-------|---------|
| Product tags contain `ultra-luxury`, `ultra luxury`, or `vip` | Tag: `ultra-luxury` |
| Order-level tags contain ultra-luxury keywords | Order tag: `ultra-luxury` |
| SKU starts with `UL-` | SKU: `UL-LAMER-001` |
| Product title contains "ultra luxury" or "ultra-luxury" | Title: "Tom Ford Lip Color Ultra Luxury" |
| Product type contains "ultra-luxury" | Type: `Ultra-Luxury Cosmetics` |
| Line item properties reference ultra-luxury | Property: `{ name: "collection", value: "ultra-luxury" }` |
| (Optional) Price exceeds threshold | Set `ULTRA_LUXURY_MIN_PRICE=800` in handler |

### Ensuring Products Are Detected

When creating products in Shopify Admin, make sure to:
1. Add the tag `ultra-luxury` to all ultra-luxury products
2. Place them in an Ultra-Luxury collection
3. (Optional) Use a SKU prefix of `UL-` for easy identification

---

## Troubleshooting

### Email Not Sending

| Issue | Solution |
|-------|----------|
| No email received | Check server logs for errors; verify `EMAIL_API_KEY` is correct |
| HMAC verification fails | Confirm `SHOPIFY_WEBHOOK_SECRET` matches the Shopify webhook secret |
| "Unsupported EMAIL_PROVIDER" | Set `EMAIL_PROVIDER` to `sendgrid`, `mailgun`, or `postmark` |
| SendGrid 403 error | Verify sender identity in SendGrid dashboard |
| Mailgun 401 error | Check API key and domain configuration |
| Template not found | Ensure `email-templates/ultra-luxury-thankyou.html` exists relative to webhooks dir |

### Ultra-Luxury Items Not Detected

| Issue | Solution |
|-------|----------|
| Standard items triggering email | Review product tags — remove `ultra-luxury` from non-qualifying items |
| Ultra-luxury items ignored | Add the `ultra-luxury` tag to the product in Shopify Admin |
| All items flagged | Check if the order itself is tagged `ultra-luxury` (order-level tag treats all items as qualifying) |

### Webhook Not Firing

1. Check **Shopify Admin → Settings → Notifications → Webhooks** for failed deliveries
2. Ensure your server is publicly accessible (HTTPS required)
3. Verify the webhook URL is correct
4. Shopify retries failed webhooks up to 19 times over 48 hours

---

## Production Checklist

- [ ] Email provider account created and verified
- [ ] Sender domain authenticated (SPF, DKIM, DMARC)
- [ ] Environment variables configured
- [ ] Server deployed with HTTPS
- [ ] Shopify webhook configured and secret saved
- [ ] Test email preview reviewed and approved
- [ ] Test email sent and received successfully
- [ ] End-to-end test with Shopify Bogus Gateway completed
- [ ] PM2 / process manager configured for auto-restart
- [ ] Monitoring / alerting set up for email failures
- [ ] `NODE_ENV=production` set (disables test endpoints)

---

*© 2026 Dubai Dust — Luxury Redefined for the Discerning*
