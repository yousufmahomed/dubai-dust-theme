# 🚀 GitHub → Shopify Deployment Guide

## Dubai Dust Luxury Theme — Deploy from GitHub to Shopify

This guide walks you through connecting your GitHub repository to Shopify so your theme is automatically synced and deployable.

---

### Prerequisites

- ✅ A **Shopify store** (any plan)
- ✅ A **GitHub account** with access to `yousufmahomed/dubai-dust-theme`
- ✅ The theme code pushed to the `main` branch of this repository

---

### Step 1: Connect GitHub to Shopify

1. Log in to your **Shopify Admin** at `https://your-store.myshopify.com/admin`
2. Navigate to **Online Store → Themes**
3. Click **"Add theme"** (top-right area)
4. Select **"Connect from GitHub"**
5. If this is your first time, Shopify will ask you to **authorise the Shopify GitHub app**:
   - Click **"Install"** on the GitHub authorisation page
   - Grant access to the repository `yousufmahomed/dubai-dust-theme`
6. Once connected, select the repository: **`yousufmahomed/dubai-dust-theme`**
7. Select the branch: **`main`**
8. Click **"Connect"**

> 💡 **Tip:** Shopify will pull the theme from GitHub and add it to your theme library. This may take 1–2 minutes.

---

### Step 2: Publish the Theme

1. After the theme appears in your **Theme Library**, click **"..."** (three dots) next to "Dubai Dust"
2. Click **"Publish"**
3. Confirm the action — your store will now use the Dubai Dust theme

> ⚠️ **Important:** Publishing replaces your current live theme. Consider using **"Preview"** first to check everything looks correct.

---

### Step 3: Verify Auto-Sync

Once connected, Shopify automatically syncs changes from GitHub:

- **Every push to `main`** triggers an automatic update in Shopify
- You can check the sync status in **Online Store → Themes** — look for the GitHub icon next to the theme name
- The theme will show the **latest commit message** as its version identifier

---

### Step 4: Configure Theme Settings

After deploying, configure the theme in Shopify Admin:

#### Brand Settings
1. Go to **Online Store → Themes → Customise**
2. Click **Theme settings** (gear icon, bottom-left)
3. Set your **brand name**, **tagline**, and **logo**
4. Configure **colours** (the theme defaults to dark + gold luxury palette)

#### Collections Setup
1. Create your collections in **Products → Collections**
2. For **Ultra-Luxury collections**: add the tag `ultra-luxury` to the collection
3. For **Standard collections**: add the tag `standard-collection`
4. Assign the appropriate **collection template**:
   - `collection.ultra-luxury` — for ultra-luxury with VIP gate
   - `collection.standard` — for standard collections with Velvet Rope
   - `collection.vip-gate` — for VIP deposit gating

#### VIP Deposit Product
1. Create a product called **"VIP Viewing Deposit"** priced at **R250**
2. Set its handle to match your `vip_deposit_product_handle` theme setting
3. This product is used for the ultra-luxury collection access gate

#### Navigation
1. Go to **Online Store → Navigation**
2. Create or edit the **Main menu** with links to your collections and pages
3. The theme uses a `menu` link list — assign it in **Theme settings → Header**

---

### Step 5: Set Up the AI Concierge Chatbot

The theme includes an embedded **Abacus.AI Shopping Concierge** chatbot. It loads automatically via:

- `assets/chatbot-widget-custom.css` — luxury styling overrides
- `assets/chatbot-widget-init.js` — initialisation and positioning
- The SDK script in `layout/theme.liquid`

**No additional setup required** — the chatbot is pre-configured and will appear on all pages.

To change the chatbot's welcome message, edit `assets/chatbot-widget-init.js`.

---

### Step 6: Set Up Email Automation (Optional)

For the ultra-luxury thank-you email system:

1. See `email-templates/EMAIL_SETUP.md` for full instructions
2. Deploy the webhook handler from `webhooks/order-webhook-handler.js`
3. Configure your email provider (SendGrid, Mailgun, or Postmark)
4. Register the webhook in **Shopify Admin → Settings → Notifications → Webhooks**

---

### Ongoing Development Workflow

```
# Make changes locally
cd /path/to/dubai-dust-theme

# Test with Shopify CLI (optional)
shopify theme dev --store=your-store.myshopify.com

# Commit and push
git add .
git commit -m "Your change description"
git push origin main

# Shopify auto-syncs within ~60 seconds ✨
```

---

### Troubleshooting

#### Theme not appearing after connecting GitHub
- Ensure the repository has the correct **Shopify theme structure** (layout/, templates/, config/, etc.)
- Check that you selected the correct **branch** (`main`)
- Try disconnecting and reconnecting the repository

#### GitHub connection fails
- Make sure the **Shopify GitHub app** has access to the repository
- Go to GitHub → **Settings → Applications → Shopify** and verify repository access
- If the repo is private, ensure the Shopify app has been granted access to private repos

#### Theme shows errors after sync
- Check that `config/settings_schema.json` is valid JSON
- Verify all Liquid files have correct syntax
- Look at the **Shopify theme editor** for specific error messages
- Use `shopify theme check` locally to lint your theme files

#### Velvet Rope timer not working
- Ensure the collection has the correct tag (`ultra-luxury-collection` or `standard-collection`)
- Check `localStorage` in browser DevTools → Application tab
- Verify `snippets/velvet-rope.liquid` is included in `layout/theme.liquid`

#### VIP Deposit gate not showing
- Confirm the VIP Deposit product exists and is **active** (not draft)
- Verify the product handle matches `vip_deposit_product_handle` in theme settings
- Check the collection is using the `collection.ultra-luxury` or `collection.vip-gate` template

#### Chatbot not appearing
- Check browser console for JavaScript errors
- Verify the Abacus.AI SDK script tag is present in `layout/theme.liquid`
- Ensure `chatbot-widget-init.js` and `chatbot-widget-custom.css` are in the `assets/` folder
- The chatbot requires an internet connection to load the external SDK

#### Changes not syncing to Shopify
- Verify the GitHub connection is still active in **Online Store → Themes**
- Push to the correct branch (`main`)
- Check for merge conflicts or failed pushes on GitHub
- Try manually triggering a sync by clicking **"..."** → **"Update from GitHub"** on the theme

---

### File Structure Reference

```
dubai-dust-theme/
├── layout/
│   └── theme.liquid              # Main layout wrapper
├── templates/
│   ├── index.liquid              # Homepage
│   ├── product.liquid            # Product pages
│   ├── collection.liquid         # Default collection
│   ├── collection.standard.liquid
│   ├── collection.ultra-luxury.liquid
│   ├── collection.vip-gate.liquid
│   ├── cart.liquid               # Cart page
│   ├── search.liquid             # Search results
│   ├── page.liquid               # Static pages
│   ├── list-collections.liquid   # All collections page
│   ├── 404.liquid                # Error page
│   └── customers/                # Account pages
├── sections/
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero.liquid
│   ├── announcement-bar.liquid
│   ├── featured-collections.liquid
│   └── product-grid.liquid
├── snippets/
│   ├── product-card.liquid
│   ├── cart-drawer.liquid
│   └── velvet-rope.liquid
├── assets/
│   ├── theme.css                 # Main stylesheet
│   ├── theme.js                  # Core JavaScript
│   ├── checkout-discount.js      # VIP 7% discount logic
│   ├── chatbot-widget-custom.css # AI concierge styling
│   └── chatbot-widget-init.js    # AI concierge initialisation
├── config/
│   ├── settings_schema.json      # Theme settings definitions
│   └── settings_data.json        # Theme settings values
├── locales/
│   └── en.default.json           # English translations
├── email-templates/              # Ultra-luxury email system
│   ├── ultra-luxury-thankyou.html
│   └── EMAIL_SETUP.md
├── webhooks/                     # Order webhook handler
│   ├── order-webhook-handler.js
│   ├── package.json
│   └── .env.example
├── README.md
├── SETUP.md
└── GITHUB_SHOPIFY_DEPLOYMENT.md  # This file
```

---

### Support

- **Store enquiries:** Dubai Dust customer support
- **Theme technical issues:** Review `SETUP.md` for detailed configuration
- **Email automation:** See `email-templates/EMAIL_SETUP.md`
- **Shopify GitHub integration:** [Shopify Docs — GitHub Integration](https://shopify.dev/docs/storefronts/themes/tools/github)

---

*Dubai Dust — Arabian Luxury, Delivered* ✨
