/* ============================================================
   Dubai Dust AI Shopping Concierge — Widget Initialisation
   Customises the Abacus.AI chat widget after the SDK loads.
   ============================================================ */

(function () {
  'use strict';

  /* ---- Configuration ---- */
  var CONFIG = {
    welcomeMessage: 'Welcome to Dubai Dust. How may I assist you today?',
    brandName: 'Dubai Dust Concierge',
    position: 'bottom-right',
    zIndex: 99999,
    colors: {
      primary: '#d4a853',
      primaryDark: '#c49b45',
      background: '#0a0e1a',
      headerBg: '#0d1225',
      text: '#f5f0e8',
      textMuted: '#a0998c'
    },
    spacing: {
      desktop: { bottom: 24, right: 24 },
      mobile: { bottom: 16, right: 16 }
    }
  };

  /* ---- Helpers ---- */

  /** Wait for a DOM element to appear, then run callback. */
  function waitForElement(selectors, callback, maxAttempts) {
    maxAttempts = maxAttempts || 60;
    var attempts = 0;
    var timer = setInterval(function () {
      var el = null;
      for (var i = 0; i < selectors.length; i++) {
        el = document.querySelector(selectors[i]);
        if (el) break;
      }
      if (el) {
        clearInterval(timer);
        callback(el);
      } else if (++attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 500);
  }

  /** Apply a map of CSS properties to a DOM element. */
  function applyStyles(el, styles) {
    if (!el) return;
    for (var prop in styles) {
      if (styles.hasOwnProperty(prop)) {
        el.style.setProperty(prop, styles[prop], 'important');
      }
    }
  }

  /* ---- Widget Customisation ---- */

  function customiseLauncher() {
    var selectors = [
      '.abacus-chat-widget-launcher',
      '#abacus-chat-widget-launcher',
      '[class*="ChatWidget__Launcher"]',
      '[class*="launcher"]'
    ];

    waitForElement(selectors, function (launcher) {
      /* Ensure positioning */
      applyStyles(launcher, {
        'position': 'fixed',
        'bottom': CONFIG.spacing.desktop.bottom + 'px',
        'right': CONFIG.spacing.desktop.right + 'px',
        'z-index': String(CONFIG.zIndex)
      });

      /* Accessibility */
      launcher.setAttribute('aria-label', 'Open Dubai Dust Shopping Concierge chat');
      launcher.setAttribute('role', 'button');
      launcher.setAttribute('title', CONFIG.brandName);
    });
  }

  function customiseChatWindow() {
    var selectors = [
      '.abacus-chat-widget',
      '#abacus-chat-widget',
      '[class*="ChatWidget__Container"]',
      '[class*="chatWidget"]'
    ];

    waitForElement(selectors, function (widget) {
      applyStyles(widget, {
        'z-index': String(CONFIG.zIndex + 1),
        'font-family': "'Montserrat', sans-serif"
      });
    });
  }

  /** Inject the Abacus widget SDK configuration if an API exists. */
  function configureWidgetAPI() {
    /* If the Abacus widget exposes a global config, use it */
    if (window.AbacusChatWidget && typeof window.AbacusChatWidget.configure === 'function') {
      window.AbacusChatWidget.configure({
        welcomeMessage: CONFIG.welcomeMessage,
        position: CONFIG.position,
        theme: {
          primaryColor: CONFIG.colors.primary,
          backgroundColor: CONFIG.colors.background,
          headerColor: CONFIG.colors.headerBg,
          textColor: CONFIG.colors.text,
          fontFamily: "'Montserrat', sans-serif"
        }
      });
    }

    /* Alternative: set data attributes on any widget root the SDK may read */
    var roots = document.querySelectorAll('[data-abacus-chat], #abacus-chat-widget-root');
    roots.forEach(function (root) {
      root.setAttribute('data-welcome-message', CONFIG.welcomeMessage);
      root.setAttribute('data-position', CONFIG.position);
      root.setAttribute('data-primary-color', CONFIG.colors.primary);
    });
  }

  /** Add a subtle tooltip / label next to the launcher on first visit. */
  function showWelcomeTooltip() {
    if (sessionStorage.getItem('dd_chat_tooltip_shown')) return;

    waitForElement([
      '.abacus-chat-widget-launcher',
      '#abacus-chat-widget-launcher',
      '[class*="ChatWidget__Launcher"]'
    ], function (launcher) {
      var tip = document.createElement('div');
      tip.id = 'dd-chat-tooltip';
      tip.textContent = 'Need styling advice?';
      tip.style.cssText = [
        'position: fixed',
        'bottom: ' + (CONFIG.spacing.desktop.bottom + 72) + 'px',
        'right: ' + (CONFIG.spacing.desktop.right + 4) + 'px',
        'background: #0d1225',
        'color: #d4a853',
        'font-family: Montserrat, sans-serif',
        'font-size: 12px',
        'font-weight: 500',
        'padding: 8px 14px',
        'border-radius: 8px',
        'border: 1px solid rgba(212,168,83,0.25)',
        'box-shadow: 0 4px 16px rgba(0,0,0,0.35)',
        'z-index: ' + (CONFIG.zIndex - 1),
        'opacity: 0',
        'transform: translateY(8px)',
        'transition: all 0.4s ease',
        'pointer-events: none',
        'white-space: nowrap'
      ].join(';');

      document.body.appendChild(tip);

      /* Fade in after a short delay */
      setTimeout(function () {
        tip.style.opacity = '1';
        tip.style.transform = 'translateY(0)';
      }, 2000);

      /* Auto-hide after 6 seconds */
      setTimeout(function () {
        tip.style.opacity = '0';
        tip.style.transform = 'translateY(8px)';
        setTimeout(function () { tip.remove(); }, 500);
      }, 8000);

      sessionStorage.setItem('dd_chat_tooltip_shown', '1');
    });
  }

  /* ---- Responsive Adjustments ---- */

  function applyMobileAdjustments() {
    if (window.innerWidth > 768) return;

    var selectors = [
      '.abacus-chat-widget-launcher',
      '#abacus-chat-widget-launcher',
      '[class*="ChatWidget__Launcher"]'
    ];

    waitForElement(selectors, function (launcher) {
      applyStyles(launcher, {
        'bottom': CONFIG.spacing.mobile.bottom + 'px',
        'right': CONFIG.spacing.mobile.right + 'px'
      });
    });
  }

  /* ---- Bootstrap ---- */

  function init() {
    configureWidgetAPI();
    customiseLauncher();
    customiseChatWindow();
    showWelcomeTooltip();
    applyMobileAdjustments();

    /* Re-apply on resize (debounced) */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        applyMobileAdjustments();
      }, 250);
    });
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
