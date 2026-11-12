/**
 * Team page — one switch that governs every portrait.
 *
 * Three behaviours, in order of scope:
 *   1. the global Documentary / Illustrated toggle (with a stagger so the
 *      change travels down the page rather than flashing at once);
 *   2. the group-photo comparison slider (native range input, so it is
 *      draggable, keyboard-operable and announced correctly);
 *   3. a per-card ⇄ that flips one portrait without touching the rest.
 */
(function () {
  'use strict';

  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------------------
  // 1. Global mode
  // ---------------------------------------------------------------------------
  function initMode() {
    const opts = [...document.querySelectorAll('.ll-mode__opt')];
    if (!opts.length) return;

    const members = [...document.querySelectorAll('[data-person]')];
    const group = document.querySelector('[data-compare]');

    // The illustrated layer must be resident before the first switch, or the
    // first click shows an empty frame while the image decodes.
    members.forEach((m) => {
      const art = m.querySelector('.ll-person__img--art');
      if (art && art.decode) art.decode().catch(() => {});
    });
    const groupArt = document.querySelector('.ll-portrait__img--art');
    if (groupArt && groupArt.decode) groupArt.decode().catch(() => {});

    function setMode(mode, animate) {
      opts.forEach((o) => {
        const on = o.dataset.mode === mode;
        o.classList.toggle('is-current', on);
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      const stagger = animate && !prefersReduced();

      // group photo: full illustration = the seam all the way left
      const range = document.querySelector('[data-compare-range]');
      if (range) range.value = mode === 'illustrated' ? '0' : '100';
      applyCompare(animate);

      members.forEach((m, i) => {
        m.classList.toggle('is-art', mode === 'illustrated');
        if (stagger) {
          // a slight, ordered delay: the change reads as a wave down the page
          m.style.transitionDelay = `${Math.min(i * 60, 420)}ms`;
          setTimeout(() => { m.style.transitionDelay = ''; }, 700);
        }
      });

      try { localStorage.setItem('mch_team_mode', mode); } catch (e) {}
    }

    opts.forEach((o) => {
      o.addEventListener('click', () => setMode(o.dataset.mode, true));
    });

    // restore the reader's last choice, without animating on load
    let saved = null;
    try { saved = localStorage.getItem('mch_team_mode'); } catch (e) {}
    // Default to the photograph. The illustrated layer is the reward for
    // pressing the wand, and a first visit should read as a scientific group
    // before it reads as a drawing.
    setMode(saved === 'illustrated' ? 'illustrated' : 'real', false);

    window.__teamSetMode = setMode;
  }

  // ---------------------------------------------------------------------------
  // 2. Group-photo comparison
  // ---------------------------------------------------------------------------
  function applyCompare(animate) {
    const range = document.querySelector('[data-compare-range]');
    const art = document.querySelector('.ll-portrait__img--art');
    const seam = document.querySelector('[data-compare-seam]');
    if (!range || !art) return;

    const pct = Number(range.value);       // 100 = all photograph, 0 = all art
    art.style.clipPath = `inset(0 0 0 ${pct}%)`;
    if (seam) seam.style.left = `${pct}%`;
    if (!animate) {
      art.style.transition = 'none';
      if (seam) seam.style.transition = 'none';
      // restore on the next frame so later drags animate normally
      requestAnimationFrame(() => {
        art.style.transition = '';
        if (seam) seam.style.transition = '';
      });
    }
  }

  function initCompare() {
    const range = document.querySelector('[data-compare-range]');
    if (!range) return;
    range.addEventListener('input', () => applyCompare(true));

    // A keypress on the slider should not also be read as "switch everything".
    range.addEventListener('keydown', (e) => e.stopPropagation());

    // the handle should look interactive, not decorative
    range.addEventListener('pointerdown', () => {
      range.dataset.dragging = 'true';
    });
    window.addEventListener('pointerup', () => {
      delete range.dataset.dragging;
    });

    applyCompare(false);
  }

  // ---------------------------------------------------------------------------
  // 3. Per-card flip
  // ---------------------------------------------------------------------------
  function initCards() {
    document.querySelectorAll('[data-person-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('[data-person]');
        if (!card) return;
        card.classList.toggle('is-art');
      });
    });
  }

  function init() {
    initMode();
    initCompare();
    initCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
