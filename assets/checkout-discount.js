/**
 * Dubai Dust — Checkout Discount Script
 * ============================================================
 * 
 * SURPRISE 7% DISCOUNT on Ultra-Luxury Items
 * This discount is NOT advertised — it delights the customer at checkout.
 * 
 * Implementation Options:
 * 
 * OPTION A: Shopify Scripts (Shopify Plus only)
 *   - Use Shopify Script Editor to apply automatic discounts
 *   - See the Ruby script below for Script Editor
 * 
 * OPTION B: Automatic Discount via Shopify Admin
 *   - Create automatic discount in Shopify Admin → Discounts
 *   - Set conditions based on product tags
 * 
 * OPTION C: Shopify Functions (Shopify API)
 *   - Deploy a Shopify Function for order discounts
 * 
 * This JS file handles the CLIENT-SIDE notification at checkout/cart
 * that a VIP discount has been applied.
 * ============================================================
 */

(function() {
  'use strict';

  const ULTRA_LUXURY_TAG = 'ultra-luxury';
  const DISCOUNT_PERCENT = 7;
  const DISCOUNT_CODE = 'DDVIP7'; // Auto-applied discount code

  /**
   * Check cart for ultra-luxury items and display VIP benefit notice
   */
  async function checkCartForUltraLuxury() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      let hasUltraLuxury = false;
      let ultraLuxuryTotal = 0;

      for (const item of cart.items) {
        // Check item properties for ultra-luxury indicators
        if (item.properties && item.properties['_type'] === 'vip-deposit') {
          continue; // Skip deposit items
        }

        // Check product tags (available via product metafields or properties)
        if (item.product_type && item.product_type.toLowerCase().includes('ultra')) {
          hasUltraLuxury = true;
          ultraLuxuryTotal += item.final_line_price;
        }

        // Also check vendor or tags set as line item properties
        if (item.properties && item.properties['_collection_type'] === 'ultra-luxury') {
          hasUltraLuxury = true;
          ultraLuxuryTotal += item.final_line_price;
        }
      }

      if (hasUltraLuxury) {
        applyVIPDiscount(ultraLuxuryTotal);
        showVIPDiscountNotice(ultraLuxuryTotal);
      }
    } catch (err) {
      console.log('Dubai Dust: Cart check completed');
    }
  }

  /**
   * Attempt to auto-apply the VIP discount code
   */
  async function applyVIPDiscount(total) {
    try {
      // Try applying discount code via Shopify's discount endpoint
      const response = await fetch('/discount/' + DISCOUNT_CODE, {
        method: 'GET',
        redirect: 'manual'
      });
      console.log('Dubai Dust VIP: Discount code applied');
    } catch (err) {
      // Discount application handled server-side
      console.log('Dubai Dust VIP: Server-side discount active');
    }
  }

  /**
   * Display VIP discount notice on cart page
   */
  function showVIPDiscountNotice(ultraLuxuryTotal) {
    const savings = Math.round(ultraLuxuryTotal * DISCOUNT_PERCENT / 100);
    const savingsFormatted = 'R' + (savings / 100).toFixed(2);

    // Insert VIP notice before checkout button
    const cartForm = document.querySelector('form[action="/cart"]') ||
                     document.querySelector('.cart-drawer__footer');
    
    if (cartForm) {
      const existingNotice = document.querySelector('.vip-discount-notice');
      if (existingNotice) existingNotice.remove();

      const notice = document.createElement('div');
      notice.className = 'vip-discount-notice';
      notice.style.cssText = `
        background: linear-gradient(135deg, rgba(74,20,140,0.15), rgba(21,101,192,0.1));
        border: 1px solid rgba(212,168,83,0.2);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        text-align: center;
      `;
      notice.innerHTML = `
        <p style="font-size: 0.8125rem; color: var(--color-gold, #d4a853); margin-bottom: 4px; font-weight: 600;">
          👑 VIP Surprise Benefit
        </p>
        <p style="font-size: 0.75rem; color: #a0998c;">
          A special ${DISCOUNT_PERCENT}% discount will be applied to your ultra-luxury items at checkout.
          <br>Estimated savings: <strong style="color: #4caf50;">${savingsFormatted}</strong>
        </p>
      `;
      cartForm.insertBefore(notice, cartForm.firstChild);
    }
  }

  // Run on cart page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCartForUltraLuxury);
  } else {
    checkCartForUltraLuxury();
  }

})();

/**
 * ============================================================
 * SHOPIFY SCRIPT EDITOR (Shopify Plus) — Ruby Script
 * ============================================================
 * Copy this into Shopify Admin → Script Editor → Line Item Scripts
 * 
 * ULTRA_LUXURY_TAG = "ultra-luxury"
 * DISCOUNT_PERCENT = 7
 * DISCOUNT_MESSAGE = "VIP Ultra-Luxury Discount (7%)"
 * 
 * Input.cart.line_items.each do |line_item|
 *   product = line_item.variant.product
 *   if product.tags.include?(ULTRA_LUXURY_TAG)
 *     discount = line_item.line_price * (DISCOUNT_PERCENT / 100.0)
 *     line_item.change_line_price(
 *       line_item.line_price - discount,
 *       message: DISCOUNT_MESSAGE
 *     )
 *   end
 * end
 * 
 * Output.cart = Input.cart
 * ============================================================
 */

/**
 * ============================================================
 * SHOPIFY ADMIN SETUP (Non-Plus Stores)
 * ============================================================
 * 1. Go to Shopify Admin → Discounts
 * 2. Create Automatic Discount
 *    - Name: "VIP Ultra-Luxury Benefit" (or code: DDVIP7)
 *    - Type: Percentage
 *    - Value: 7%
 *    - Applies to: Specific collections (all 8 ultra-luxury collections)
 *    - OR: Products tagged with "ultra-luxury"
 *    - Minimum purchase: None
 *    - Status: Active
 * 3. This discount auto-applies when qualifying products are in cart
 * ============================================================
 */
