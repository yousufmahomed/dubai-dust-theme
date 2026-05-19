# Dubai Dust — Shopify Theme Setup Guide

## 🏗️ Theme Overview

**Dubai Dust** is a custom Shopify theme built for an Arabian luxury marketplace aesthetic. It features a dark theme with gold accents, the **Velvet Rope** exclusivity timer, and a **VIP Deposit Gate** for ultra-luxury collections.

### Key Features
- ✦ Dark luxury aesthetic (#0a0e1a background, #d4a853 gold accents)
- ✦ Velvet Rope countdown timer (standard: every 25th visit, ultra-luxury: every visit)
- ✦ VIP R250 viewing deposit for ultra-luxury collections
- ✦ Surprise 7% discount on ultra-luxury items at checkout (unadvertised)
- ✦ Gift message option for ultra-luxury orders
- ✦ Mobile-responsive with Arabian-inspired design elements
- ✦ Playfair Display + Montserrat typography

---

## 📁 Theme File Structure

```
dubai-dust-theme/
├── assets/
│   ├── theme.css              # Complete brand styling
│   ├── theme.js               # Theme JavaScript (cart, gallery, etc.)
│   └── checkout-discount.js   # Ultra-luxury 7% discount logic
├── config/
│   ├── settings_schema.json   # Theme settings (colors, fonts, velvet rope, VIP)
│   └── settings_data.json     # Default settings values
├── layout/
│   └── theme.liquid           # Base layout with meta tags, fonts, analytics
├── locales/
│   └── en.default.json        # English translations
├── sections/
│   ├── announcement-bar.liquid
│   ├── featured-collections.liquid
│   ├── footer.liquid
│   ├── header.liquid
│   ├── hero.liquid
│   └── product-grid.liquid
├── snippets/
│   ├── cart-drawer.liquid      # Slide-in cart drawer
│   ├── product-card.liquid     # Reusable product card component
│   └── velvet-rope.liquid      # ⭐ Velvet Rope exclusivity feature
├── templates/
│   ├── 404.liquid
│   ├── cart.liquid
│   ├── collection.liquid           # Default collection template
│   ├── collection.standard.liquid  # Standard collections template
│   ├── collection.ultra-luxury.liquid  # Ultra-luxury with VIP gate
│   ├── collection.vip-gate.liquid  # Standalone VIP gate template
│   ├── index.liquid                # Homepage
│   ├── list-collections.liquid     # All collections page
│   ├── page.liquid                 # Default page
│   ├── product.liquid              # Product detail page
│   ├── search.liquid               # Search results
│   └── customers/
│       ├── account.liquid
│       ├── login.liquid
│       └── register.liquid
├── SETUP.md                    # This file
└── README.md
```

---

## 🚀 Deployment Options

### Option 1: Shopify CLI (Recommended)

```bash
# 1. Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# 2. Navigate to the theme directory
cd dubai-dust-theme

# 3. Login to your Shopify store
shopify auth login --store dubaidust.myshopify.com

# 4. Push theme to Shopify
shopify theme push

# 5. Or start development server for live preview
shopify theme dev
```

### Option 2: GitHub Integration

```bash
# 1. Initialize git repo (if not done)
cd dubai-dust-theme
git init
git add .
git commit -m "Initial Dubai Dust theme"

# 2. Push to GitHub
git remote add origin https://github.com/yousufmahomed/dubai-dust-theme.git
git branch -M main
git push -u origin main

# 3. In Shopify Admin:
#    → Online Store → Themes → Add theme → Connect from GitHub
#    → Select repository: yousufmahomed/dubai-dust-theme
#    → Branch: main
```

### Option 3: ZIP Upload

```bash
# Create a ZIP file of the theme
cd /home/ubuntu
zip -r dubai-dust-theme.zip dubai-dust-theme/

# In Shopify Admin:
# → Online Store → Themes → Add theme → Upload ZIP file
# → Select dubai-dust-theme.zip
```

---

## 🏷️ Collection Setup

### 16 Collections to Create

#### Standard Collections (8)
Tag each with `standard-collection` and use template `collection.standard`:

| Collection | Handle | Products |
|-----------|--------|----------|
| Cosmetics | `cosmetics` | 10 |
| Jewellery | `jewellery` | 9 |
| Perfume | `perfume` | 8 |
| Small Electronics | `small-electronics` | 6 |
| Phone & Smartwatch Accessories | `phone-smartwatch-accessories` | 10 |
| Men's Luxury Watches | `mens-luxury-watches` | 4 |
| Ladies' Luxury Watches | `ladies-luxury-watches` | 3 |
| Handbags | `handbags` | 11+ |

#### Ultra-Luxury Collections (8)
Tag each with `ultra-luxury-collection` and use template `collection.ultra-luxury`:

| Collection | Handle | Products |
|-----------|--------|----------|
| Ultra Luxury Cosmetics | `ultra-luxury-cosmetics` | 3 |
| Ultra Luxury Jewellery | `ultra-luxury-jewellery` | 4 |
| Ultra Luxury Perfume | `ultra-luxury-perfume` | 4 |
| Ultra Luxury Electronics | `ultra-luxury-electronics` | 6 |
| Ultra Luxury Accessories | `ultra-luxury-accessories` | 2 |
| Ultra Luxury Men's Watches | `ultra-luxury-mens-watches` | 7 |
| Ultra Luxury Ladies' Watches | `ultra-luxury-ladies-watches` | 3 |
| Ultra Luxury Handbags | `ultra-luxury-handbags` | 9 |

### Assigning Collection Templates

1. Go to **Shopify Admin → Products → Collections**
2. Select a collection
3. In the right sidebar under "Theme template", select:
   - `collection.standard` for standard collections
   - `collection.ultra-luxury` for ultra-luxury collections

---

## 🏷️ Product Tagging Guide

### Required Tags

| Tag | Purpose | Apply To |
|-----|---------|----------|
| `standard-collection` | Identifies standard products | All standard products |
| `ultra-luxury` | Identifies ultra-luxury products | All ultra-luxury products |
| `new` | Shows "New" badge on product card | Newly added products |

### Product Types (for Shopify filtering)
Set the Product Type field to match the collection category:
- `Cosmetics`, `Jewellery`, `Perfume`, `Electronics`, `Accessories`, `Watch`, `Handbag`

### Vendor Field
Set the Vendor field to the supplier name (displayed subtly on product pages):
- The Scents SA, KillerDeals, Gadgetgyz, Men's Republic, Calasca Trading, etc.

---

## 🎰 Velvet Rope Configuration

The Velvet Rope feature is configured in **Theme Settings**:

1. Go to **Shopify Admin → Online Store → Themes → Customize**
2. Click **Theme Settings** (bottom left)
3. Find **Velvet Rope Settings**

| Setting | Default | Description |
|---------|---------|-------------|
| Enable Velvet Rope | ✅ On | Master toggle |
| Standard Visit Threshold | 25 | Timer appears every Nth visit |
| Standard Timer Min (seconds) | 90 | Minimum timer duration |
| Standard Timer Max (seconds) | 110 | Maximum timer duration |
| Ultra-Luxury Timer Min (seconds) | 170 | Minimum timer for ultra-luxury |
| Ultra-Luxury Timer Max (seconds) | 190 | Maximum timer for ultra-luxury |

### How It Works
- **Standard Collections**: Timer shows on every 25th visit, randomized 90–110 seconds
- **Ultra-Luxury Collections**: Timer shows on EVERY visit, randomized 170–190 seconds
- Visit counts stored in customer's browser via `localStorage`
- Timer unlocks are session-based (30 minute expiry)
- Standard timer allows early close after 50% completion
- Ultra-luxury timer must run to completion (no close button)

---

## 👑 VIP Deposit Setup

### Create the Deposit Product

1. Go to **Shopify Admin → Products → Add product**
2. Create a product with these settings:
   - **Title**: VIP Viewing Deposit
   - **Handle**: `vip-viewing-deposit` (important!)
   - **Price**: R250.00
   - **Compare at price**: Leave blank
   - **Inventory**: Don't track inventory
   - **Status**: Active
   - **Sales channels**: Remove from Online Store listing (hide from search/browse)
   - **Tags**: `vip-deposit`, `hidden`
3. The VIP gate template automatically references this product handle

### Configure VIP Settings
In Theme Settings:
- **Enable VIP Deposit Gate**: ✅ On
- **Deposit Amount**: 250
- **Deposit Product Handle**: `vip-viewing-deposit`

---

## 🎁 Surprise 7% Discount Setup

This discount is **NOT advertised** — it surprises customers at checkout.

### Shopify Admin Setup (Recommended)
1. Go to **Shopify Admin → Discounts → Create discount**
2. Choose **Automatic discount**
3. Configure:
   - **Name**: VIP Ultra-Luxury Benefit
   - **Type**: Percentage
   - **Value**: 7%
   - **Applies to**: Products tagged with `ultra-luxury`
   - **Minimum purchase**: None
   - **Status**: Active
   - **Combine with**: Allow combination with other discounts

### Alternative: Discount Code
If automatic discounts aren't available:
1. Create discount code: `DDVIP7`
2. The `checkout-discount.js` script attempts to auto-apply this code

### For Shopify Plus (Script Editor)
Copy the Ruby script from `assets/checkout-discount.js` comments into Script Editor.

---

## 🎨 Theme Customization

### Colors (Theme Settings → Brand Colors)
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | `#0a0e1a` | Primary background |
| Gold | `#d4a853` | CTAs, accents, text highlights |
| Gold Alt | `#D4AF37` | Gradients |
| Deep Purple | `#4A148C` | Curtain animation, ultra-luxury |
| Royal Blue | `#1565C0` | Curtain animation, secondary |

### Typography
- **Headings**: Playfair Display (loaded from Google Fonts)
- **Body**: Montserrat (loaded from Google Fonts)

### Navigation Menu
1. Go to **Shopify Admin → Online Store → Navigation**
2. Create/edit "Main Menu" with links:
   - Collections → /collections
   - Cosmetics → /collections/cosmetics
   - Jewellery → /collections/jewellery
   - Perfume → /collections/perfume
   - Handbags → /collections/handbags
   - Watches → /collections/mens-luxury-watches
   - Ultra-Luxury → /collections (filtered by ultra-luxury)
   - About → /pages/about
   - Contact → /pages/contact

---

## 📱 Mobile Optimization

The theme is mobile-first responsive:
- Sticky header with hamburger menu on screens < 960px
- Product grid collapses to 2 columns on mobile
- Touch-friendly buttons and inputs
- Optimized image loading with lazy loading
- Cart drawer accessible on all devices

---

## ✅ Pre-Launch Checklist

- [ ] Push theme to Shopify
- [ ] Create all 16 collections with correct tags and templates
- [ ] Add all 96 products with proper tags, pricing, and vendors
- [ ] Create VIP Viewing Deposit product (R250, handle: vip-viewing-deposit)
- [ ] Set up 7% automatic discount for ultra-luxury products
- [ ] Configure navigation menus
- [ ] Create legal pages (Privacy, Terms, Shipping, Returns, Disclaimer)
- [ ] Set up Yoco payment gateway with live API keys
- [ ] Connect dubaidust.org domain
- [ ] Test Velvet Rope on both standard and ultra-luxury collections
- [ ] Test VIP deposit flow end-to-end
- [ ] Test checkout discount on ultra-luxury order
- [ ] Remove Shopify password page
- [ ] Test on mobile devices

- [ ] Verify AI Shopping Concierge chatbot widget loads and is styled correctly

---

## 🤖 AI Shopping Concierge (Chatbot Widget)

The theme includes an embedded **Dubai Dust AI Shopping Concierge** powered by Abacus.AI. It appears as a gold chat bubble in the bottom-right corner of every page.

### How It Works

| File | Purpose |
|---|---|
| `layout/theme.liquid` | Loads the widget SDK script and custom CSS/JS |
| `assets/chatbot-widget-custom.css` | Luxury styling overrides for the widget |
| `assets/chatbot-widget-init.js` | Initialisation, positioning, tooltips, and responsive behaviour |

### Widget Details

- **App ID**: `101eeb881c`
- **SDK URL**: `https://api.abacus.ai/api/v0/getChatBotWidgetSDKLink?externalApplicationId=101eeb881c`
- **Public Chat URL**: `https://apps.abacus.ai/chatllm/?appId=101eeb881c&hideTopBar=2`

### Loading Order (in `theme.liquid`)

1. `chatbot-widget-custom.css` — loaded in `<head>` after `theme.css`
2. Abacus.AI Widget SDK `<script>` — loaded before `</body>` with `defer`
3. `chatbot-widget-init.js` — loaded after the SDK with `defer`

### Styling Customisations Applied

| Element | Style |
|---|---|
| Chat bubble | Gold gradient (`#d4a853`→`#c49b45`) with pulse glow animation |
| Chat window | Dark background (`#0a0e1a`) with subtle gold border |
| Header | Darker background with decorative gold divider line |
| User messages | Gold gradient background with dark text |
| Bot messages | Translucent dark with gold-accent border |
| Input area | Dark with gold-border focus ring |
| Send button | Gold gradient matching the bubble |
| Typography | Montserrat body, Playfair Display header |
| Scrollbar | Thin gold-tinted scrollbar |
| Decorative | Arabian star (✦) and diamond (◆) accents |

### Mobile Responsiveness

- **≤ 768 px** — Bubble shrinks to 56 px; chat window stretches near full-width.
- **≤ 480 px** — Chat window goes full-width, bottom-docked with rounded top corners.
- **Touch devices** — Minimum 48 px touch targets on bubble and send button.

### Changing the Welcome Tooltip

Edit `assets/chatbot-widget-init.js` and update the `tip.textContent` value inside the `showWelcomeTooltip` function.

### Changing Widget Colours

Edit `assets/chatbot-widget-custom.css`. The main brand tokens to search/replace:

- **Gold**: `#d4a853` / `rgba(212, 168, 83, …)`
- **Dark background**: `#0a0e1a`
- **Header background**: `#0d1225`
- **Text**: `#f5f0e8`

### Replacing the Chatbot

To swap for a different Abacus.AI chatbot, update the `externalApplicationId` query parameter in the SDK `<script>` tag inside `layout/theme.liquid`.

---

## 📧 Support

- **Store Email**: hello@dubaidust.org
- **Technical Support**: support@dubaidust.org
- **Domain**: dubaidust.org
- **Location**: Newcastle, KwaZulu-Natal, South Africa
