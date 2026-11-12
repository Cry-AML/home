/**
 * Wen Laboratory — scroll choreography for the journal skin.
 *
 * The notebook skin draws itself in with the ink engine: every path strokes
 * on, every sheet drops onto the desk. The journal skin suppressed all of
 * that (a journal is set, not sketched) and put nothing in its place, so the
 * page arrived as one flat slab and then did nothing at all as you scrolled.
 *
 * This restores a reading rhythm without turning the page into a slideshow:
 *
 *   · blocks enter once, when they first come into view, with a short rise and
 *     fade — 320–420ms, well under the threshold where it feels like waiting;
 *   · siblings in a grid stagger by 60ms, so a row of cards reads left to
 *     right rather than snapping as a block;
 *   · nothing re-animates on scroll-back, because a page that keeps moving
 *     behind you is harder to read, not more alive.
 *
 * It runs only in the academy skin. The notebook skin keeps the ink engine's
 * own entrance, and the two must not fight over the same element.
 *
 * Under prefers-reduced-motion, and if IntersectionObserver is missing, every
 * element is revealed immediately — the content is never left hidden waiting
 * for an observer that will not fire.
 */
(function () {
  'use strict';

  var DUR = 420;
  var RISE = 14;

  function skin() {
    return document.documentElement.getAttribute('data-theme') || 'manuscript';
  }

  // Which blocks take part. Deliberately coarse: the page's own section
  // containers, not their contents, so text never arrives word by word.
  var TARGETS = [
    '.ll-sheet',
    '.ll-pillar',
    '.ll-platform',
    '.ll-person',
    '.ll-stat-cell',
    '.ll-entry',
    '.ll-pub',
    '.ll-contact-grid > *',
    '.ll-news-grid > *',
    '.ll-seat'
  ];

  var seen = new WeakSet();
  var observer = null;

  function collect() {
    var out = [];
    for (var i = 0; i < TARGETS.length; i++) {
      var nodes = document.querySelectorAll(TARGETS[i]);
      for (var j = 0; j < nodes.length; j++) {
        if (!seen.has(nodes[j])) out.push(nodes[j]);
      }
    }
    return out;
  }

  function reveal(el) {
    el.classList.add('ll-rise-in');
  }

  function init() {
    if (skin() !== 'academy') return;
    if (!('IntersectionObserver' in window)) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var els = collect();
    if (!els.length) return;

    els.forEach(function (el) {
      seen.add(el);
      el.classList.add('ll-rise');
    });

    if (reduced) {
      els.forEach(reveal);
      return;
    }

    // Everything already in view on first paint gets its turn immediately,
    // with a stagger — the reader should not look at a still page and then
    // have it start moving as they scroll. This is the opening statement of
    // the page, so it leads by a beat.
    var fold = window.innerHeight;
    var above = els.filter(function (el) {
      return el.getBoundingClientRect().top < fold * 0.9;
    });
    above.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
      reveal(el);
    });

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          // stagger siblings that enter together
          var parent = el.parentElement;
          var idx = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
          el.style.transitionDelay = Math.min(idx * 60, 300) + 'ms';
          reveal(el);
          observer.unobserve(el);
        });
      },
      // Start a little before the block reaches the fold, so the motion is
      // already over by the time the reader is looking straight at it.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    els.forEach(function (el) { observer.observe(el); });

    // Failsafe: content must never be left invisible because an observer did
    // not fire (fast scroll, print, a browser that throttles off-screen work).
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains('ll-rise-in')) reveal(el);
      });
    }, 1800);
  }

  // If the reader switches skins after load, the classes this file added must
  // not linger and double up with the notebook's own entrance.
  document.addEventListener('skinchange', function (e) {
    var next = e.detail && e.detail.skin;
    if (next === 'academy') {
      init();
    } else {
      if (observer) observer.disconnect();
      document.querySelectorAll('.ll-rise, .ll-rise-in').forEach(function (el) {
        el.classList.remove('ll-rise', 'll-rise-in');
        el.style.transitionDelay = '';
      });
      seen = new WeakSet();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
