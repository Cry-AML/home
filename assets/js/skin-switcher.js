/**
 * Wen Laboratory — skin switcher wiring.
 *
 * The heavy lifting (storing the choice, flipping the attribute, the View
 * Transition) lives in skin.js, which runs before paint. This file only
 * attaches the button and keeps its pressed state honest.
 */
(function () {
  'use strict';

  function sync(btn) {
    var skin = window.__wenlabSkin ? window.__wenlabSkin.current() : 'manuscript';
    btn.setAttribute('aria-pressed', skin === 'academy' ? 'true' : 'false');
    btn.querySelectorAll('[data-skin-opt]').forEach(function (opt) {
      opt.classList.toggle('is-current', opt.getAttribute('data-skin-opt') === skin);
    });
  }

  function init() {
    var btn = document.getElementById('skin-switcher');
    if (!btn || !window.__wenlabSkin) return;

    sync(btn);

    btn.addEventListener('click', function () {
      window.__wenlabSkin.toggle();
    });

    // The skin can change inside a View Transition callback, so mirror it from
    // the event rather than from the return value of toggle().
    document.addEventListener('skinchange', function () { sync(btn); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
