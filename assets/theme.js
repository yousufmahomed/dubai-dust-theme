/**
 * Dubai Dust — Theme JavaScript
 * Luxury Within Reach
 */

(function() {
  'use strict';

  /* ============================================================
     MOBILE NAVIGATION
     ============================================================ */
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');

  if (mobileMenuToggle && siteNav) {
    mobileMenuToggle.addEventListener('click', () => {
      siteNav.classList.add('mobile-open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (mobileCloseBtn && siteNav) {
    mobileCloseBtn.addEventListener('click', () => {
      siteNav.classList.remove('mobile-open');
      document.body.style.overflow = '';
    });
  }

  /* ============================================================
     CART DRAWER
     ============================================================ */
  const cartToggle = document.querySelector('[data-cart-toggle]');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-drawer-overlay');
  const cartClose = document.querySelector('.cart-drawer__close');

  function openCartDrawer() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartToggle) cartToggle.addEventListener('click', openCartDrawer);
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  /* ============================================================
     ADD TO CART
     ============================================================ */
  document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const form = this.closest('form');
      if (!form) return;

      const formData = new FormData(form);
      this.classList.add('adding');
      this.disabled = true;
      const originalText = this.innerHTML;
      this.innerHTML = '<span class="loading-spinner"></span> Adding...';

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();

        this.classList.remove('adding');
        this.classList.add('added');
        this.innerHTML = '✓ Added to Cart';

        // Update cart count
        updateCartCount();
        showToast('✨', `${data.title} added to your cart`);

        setTimeout(() => {
          this.classList.remove('added');
          this.innerHTML = originalText;
          this.disabled = false;
        }, 2000);

      } catch (err) {
        this.classList.remove('adding');
        this.innerHTML = originalText;
        this.disabled = false;
        showToast('⚠️', 'Could not add to cart. Please try again.');
      }
    });
  });

  async function updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cart.item_count;
        el.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    } catch (e) {}
  }

  /* ============================================================
     QUANTITY SELECTOR
     ============================================================ */
  document.querySelectorAll('.quantity-selector').forEach(selector => {
    const minusBtn = selector.querySelector('[data-qty-minus]');
    const plusBtn = selector.querySelector('[data-qty-plus]');
    const input = selector.querySelector('input');

    if (minusBtn && input) {
      minusBtn.addEventListener('click', () => {
        const val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
      });
    }
    if (plusBtn && input) {
      plusBtn.addEventListener('click', () => {
        const val = parseInt(input.value) || 1;
        input.value = val + 1;
      });
    }
  });

  /* ============================================================
     PRODUCT GALLERY
     ============================================================ */
  const mainImage = document.querySelector('.product-gallery__main img');
  const thumbs = document.querySelectorAll('.product-gallery__thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').src;
      if (mainImage) {
        mainImage.src = imgSrc;
        mainImage.srcset = '';
      }
      thumbs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* ============================================================
     GIFT MESSAGE TOGGLE
     ============================================================ */
  const giftCheckbox = document.querySelector('#gift-message-toggle');
  const giftTextarea = document.querySelector('.gift-message-textarea');

  if (giftCheckbox && giftTextarea) {
    giftCheckbox.addEventListener('change', function() {
      giftTextarea.style.display = this.checked ? 'block' : 'none';
    });
  }

  /* ============================================================
     VIP DEPOSIT — localStorage tracking
     ============================================================ */
  window.DubaiDust = window.DubaiDust || {};

  window.DubaiDust.checkVIPDeposit = function(collectionHandle) {
    const depositsKey = 'dd_vip_deposits';
    try {
      const deposits = JSON.parse(localStorage.getItem(depositsKey) || '{}');
      return deposits[collectionHandle] === true;
    } catch (e) {
      return false;
    }
  };

  window.DubaiDust.setVIPDeposit = function(collectionHandle) {
    const depositsKey = 'dd_vip_deposits';
    try {
      const deposits = JSON.parse(localStorage.getItem(depositsKey) || '{}');
      deposits[collectionHandle] = true;
      localStorage.setItem(depositsKey, JSON.stringify(deposits));
    } catch (e) {}
  };

  /* ============================================================
     TOAST NOTIFICATION
     ============================================================ */
  function showToast(icon, message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__message">${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('active');
    });

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
  window.DubaiDust.showToast = showToast;

  /* ============================================================
     HERO GOLD PARTICLES (decorative)
     ============================================================ */
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'gold-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = (40 + Math.random() * 60) + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (6 + Math.random() * 6) + 's';
      heroSection.appendChild(particle);
    }
  }

  /* ============================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ============================================================
     COLLECTION SORT
     ============================================================ */
  const sortSelect = document.querySelector('[data-sort-select]');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', this.value);
      window.location.href = url.toString();
    });
  }

  /* ============================================================
     LAZY IMAGE LOADING
     ============================================================ */
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imgObserver.observe(img);
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  updateCartCount();

})();
