/**
 * Wen Laboratory — skin switcher wiring.
 *
 * The heavy lifting (storing the choice, flipping the attribute, starting the
 * View Transition) lives in skin.js, which runs before paint. This file makes
 * the dropdown behave like a menu:
 *
 *   · choosing an item applies that skin and closes the menu — a menu that
 *     stays open after a choice feels stuck;
 *   · the summary always states the current skin, so the control never lies
 *     about its own state;
 *   · Escape closes it, and a click outside closes it. <details> gives us the
 *     open/close itself; these are the courtesies a native menu has and a bare
 *     <details> does not.
 */
(function () {
  'use strict';

  var NAMES = {
    manuscript: null, // filled from the summary's own initial text
    academy: null
  };

  function sync(menu) {
    var skin = window.__wenlabSkin ? window.__wenlabSkin.current() : 'manuscript';
    var glyph = menu.querySelector('[data-skin-glyph]');
    var name = menu.querySelector('[data-skin-name]');

    menu.querySelectorAll('[data-skin-opt]').forEach(function (item) {
      var on = item.getAttribute('data-skin-opt') === skin;
      item.classList.toggle('is-current', on);
      item.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on && name) {
        // reuse the item's own label: it is already localised in the template
        var label = item.querySelector('span:last-child');
        if (label) {
          if (NAMES[item.getAttribute('data-skin-opt')] === null) {
            NAMES[item.getAttribute('data-skin-opt')] = label.textContent.trim();
          }
          name.textContent = label.textContent.trim();
        }
        var g = item.querySelector('.ll-skinmenu__glyph');
        if (g && glyph) glyph.textContent = g.textContent;
      }
    });
  }

  function init() {
    var menu = document.getElementById('skin-menu');
    if (!menu || !window.__wenlabSkin) return;
    var summary = menu.querySelector('summary');

    sync(menu);

    menu.querySelectorAll('[data-skin-opt]').forEach(function (item) {
      item.addEventListener('click', function () {
        var target = item.getAttribute('data-skin-opt');
        if (target !== window.__wenlabSkin.current()) {
          window.__wenlabSkin.set(target);
        }
        sync(menu);
        menu.removeAttribute('open');
        summary.focus();
      });
    });

    // mirror changes that did not come from this menu (e.g. another tab's
    // storage event, or skin.js restoring on load)
    document.addEventListener('skinchange', function () {
      sync(menu);
      menu.removeAttribute('open');
      summary.focus();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.hasAttribute('open')) {
        menu.removeAttribute('open');
        summary.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (menu.hasAttribute('open') && !menu.contains(e.target)) {
        menu.removeAttribute('open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
