/**
 * Wen Laboratory — the canopy light on the journal banner.
 *
 * The deep green band at the top of every interior page is a large, flat field.
 * A flat field of that size reads as a slab. The reference design gets its
 * composure from light moving across a surface, so this does the same thing at
 * a much lower amplitude: a very soft radial highlight that follows the pointer
 * across the band, and drifts on its own when the pointer is elsewhere.
 *
 * Two constraints shaped it:
 *
 *   · it must be cheap. The highlight is a CSS gradient whose centre is two
 *     custom properties; the script only writes those properties, on rAF, from
 *     a pointer event that is already being delivered. No layout is read.
 *   · it must not be noticed as an effect. The amplitude is 0.14 alpha at the
 *     centre, damping lags the pointer by a fraction of a second, and the
 *     autonomous drift is a 14-second cycle. You should feel it, not watch it.
 *
 * Skipped entirely under prefers-reduced-motion and on coarse pointers, where
 * a pointer-driven highlight has nothing to follow.
 */
(function () {
  'use strict';

  // Must match the selectors the gradient is painted on, or the script writes
  // custom properties to elements that never read them.
  var SEL = [
    '[data-theme="academy"] .ui-container > .mb-8',
    '[data-theme="academy"] .ll-team-head',
    '[data-theme="academy"] .ll-page-head',
    '[data-theme="academy"] .ui-container > .ll-sheet:first-child > .ll-hero-grid'
  ].join(', ');
  var IDLE_MS = 2400;

  function bind(band) {
    {
      // A single delegated listener per band, writing two custom properties.
      var target = { x: 70, y: 26 };
      var cur = { x: 70, y: 26 };
      var raf = 0;
      var lastMove = 0;

      band.style.setProperty('--mouse-x', cur.x + '%');
      band.style.setProperty('--mouse-y', cur.y + '%');

      function frame() {
        // exponential damping: 0.12 per frame reaches the pointer in ~200ms
        cur.x += (target.x - cur.x) * 0.12;
        cur.y += (target.y - cur.y) * 0.12;
        band.style.setProperty('--mouse-x', cur.x.toFixed(2) + '%');
        band.style.setProperty('--mouse-y', cur.y.toFixed(2) + '%');

        var idle = performance.now() - lastMove > IDLE_MS;
        if (idle) {
          // let it drift slowly back toward the upper right, the way light
          // moves as the afternoon passes
          target.x += (72 - target.x) * 0.004;
          target.y += (28 - target.y) * 0.004;
        }
        raf = requestAnimationFrame(frame);
      }

      band.addEventListener('pointermove', function (e) {
        var r = band.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width) * 100;
        target.y = ((e.clientY - r.top) / r.height) * 100;
        lastMove = performance.now();
      }, { passive: true });

      band.addEventListener('pointerleave', function () {
        lastMove = 0; // hand it back to the drift
      }, { passive: true });

      // only animate while the band is on screen
      loops.push(function stop() {
        cancelAnimationFrame(raf);
        raf = 0;
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              if (!raf) raf = requestAnimationFrame(frame);
            } else {
              cancelAnimationFrame(raf);
              raf = 0;
            }
          });
        }, { threshold: 0 }).observe(band);
      } else {
        raf = requestAnimationFrame(frame);
      }
    }
  }

  // The selectors are scoped to [data-theme="academy"], so on a page that
  // loads in the notebook skin there is nothing to bind yet. Bind when the
  // skin changes, and unbind when it changes away — the custom properties the
  // script writes belong to one skin and must not linger into the other.
  var bound = new WeakSet();
  // live animation handles, so switching away can stop the loops that would
  // otherwise write the properties straight back on their next frame
  var loops = [];

  function bindAll() {
    document.querySelectorAll(SEL).forEach(function (band) {
      if (bound.has(band)) return;
      bind(band);
      bound.add(band);
    });
  }

  function clearAll() {
    loops.forEach(function (stop) { stop(); });
    loops = [];
    // The skin-specific selectors no longer match once the attribute flips, so
    // sweep by the inline property the script itself sets — that is the only
    // thing it ever writes, and nothing else uses these names.
    document.querySelectorAll('*').forEach(function (el) {
      if (el.style.getPropertyValue('--mouse-x')) {
        el.style.removeProperty('--mouse-x');
        el.style.removeProperty('--mouse-y');
      }
    });
  }

  document.addEventListener('skinchange', function (e) {
    var skin = e.detail && e.detail.skin;
    if (skin === 'academy') {
      bindAll();
    } else {
      clearAll();
    }
  });

  function startup() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    bindAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startup);
  } else {
    startup();
  }
})();
