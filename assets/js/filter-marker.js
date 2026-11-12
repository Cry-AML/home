/**
 * Wen Laboratory — the publications filter as a travelling marker.
 *
 * The filters used to switch by repainting the active button: the highlight
 * vanished from one chip and appeared on the next, and the list re-flowed in a
 * single frame. That is honest but abrupt, and in the journal skin — where the
 * active chip is a solid forest block — the jump is the loudest thing on an
 * otherwise quiet page.
 *
 * Two changes, both additive to the existing filter logic:
 *
 *   1. A single marker element moves between chips instead of each chip
 *      painting its own fill. It is measured once per move and transitioned,
 *      so the eye follows one object rather than tracking a disappearing one.
 *   2. Cards that re-appear stagger in by 40ms, so the list settles rather than
 *      snapping. Cards that were already visible are not touched — animating
 *      content the reader is already looking at is worse than not animating.
 *
 * The existing filterPublications() still decides visibility; this wraps it
 * rather than replacing it, so the count, the search box and the categories all
 * keep working exactly as before.
 */
(function () {
  'use strict';

  function init() {
    var row = document.querySelector('.ll-chip-row');
    if (!row) return;
    var chips = Array.prototype.slice.call(row.querySelectorAll('.pub-filter-btn'));
    if (!chips.length) return;

    // --- the marker -------------------------------------------------------
    var marker = document.createElement('span');
    marker.className = 'll-chip-marker';
    marker.setAttribute('aria-hidden', 'true');
    row.appendChild(marker);

    function place(chip, animate) {
      if (!chip) return;
      var r = chip.getBoundingClientRect();
      var rr = row.getBoundingClientRect();
      if (!animate) marker.style.transition = 'none';
      marker.style.width = r.width + 'px';
      marker.style.height = r.height + 'px';
      marker.style.transform =
        'translate(' + (r.left - rr.left) + 'px,' + (r.top - rr.top) + 'px)';
      if (!animate) {
        // force a reflow so the next move animates from here
        void marker.offsetWidth;
        marker.style.transition = '';
      }
    }

    function activeChip() {
      return row.querySelector('.pub-filter-btn.active');
    }

    place(activeChip(), false);

    // --- stagger the cards that appear ------------------------------------
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function settleCards(animate) {
      var cards = Array.prototype.slice.call(
        document.querySelectorAll('.publication-card'));
      var i = 0;
      cards.forEach(function (card) {
        if (card.style.display === 'none') return;
        i++;
        if (!animate) {
          card.style.transition = 'none';
          card.style.opacity = '';
          card.style.transform = '';
          return;
        }
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(8px)';
        // restore on the next frame, then let the transition run
        requestAnimationFrame(function () {
          card.style.transition =
            'opacity 320ms cubic-bezier(.2,0,0,1) ' + (i * 40) + 'ms,' +
            'transform 320ms cubic-bezier(.2,0,0,1) ' + (i * 40) + 'ms';
          card.style.opacity = '';
          card.style.transform = '';
        });
      });
    }

    // --- follow the filter without wrapping it ---------------------------
    // The filter function lives in another bundle and the two may load in
    // either order, so wrapping window.filterPublications was unreliable. The
    // chips are the single entry point to it (both the click and the keyboard
    // path go through these buttons), so binding the row is enough — and it
    // keeps this file from depending on load order.
    row.addEventListener('click', function (e) {
      if (!e.target.closest('.pub-filter-btn')) return;
      // the chip's own handler runs first (it is bound directly on the button
      // and this listener is on the row), so the active class is already moved
      requestAnimationFrame(function () {
        place(activeChip(), true);
        settleCards(!reduced);
        setTimeout(function () {
          document.querySelectorAll('.publication-card').forEach(function (c) {
            c.style.transition = '';
          });
        }, 900);
      });
    });

    var search = document.getElementById('pub-search-input');
    if (search) {
      search.addEventListener('input', function () {
        // search hides and shows the same cards; move nothing, settle what is shown
        settleCards(!reduced);
      });
    }

    // keep the marker aligned across viewport changes
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { place(activeChip(), false); }, 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
