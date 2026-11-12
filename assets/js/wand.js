/**
 * Wen Laboratory — the wand is a switch, not a one-way door.
 *
 * Press it and the site becomes the notebook: ink edges, marker highlights, the
 * illustrated portraits. Press it again and the site returns to the journal:
 * sand stock, serif type, the photographs. The two states are the two readings
 * of this site, so the control that changes one should change back.
 *
 * The wand is therefore a real toggle — `aria-pressed` tracks it, the label
 * names what pressing will do, and the sparkle animation plays in both
 * directions (drawn as a cast when entering the notebook, a settle when
 * leaving).
 *
 * It stays fixed to the viewport so it is in the same place on every page, and
 * it never retires: a reader who changes their mind should not have to hunt for
 * the masthead menu to get back.
 */
(function () {
  'use strict';

  var NOTEBOOK = 'manuscript';
  var JOURNAL = 'academy';

  function init() {
    var btn = document.getElementById('wand-toggle');
    if (!btn || !window.__wenlabSkin) return;

    var label = btn.querySelector('.ll-wand__label');
    var LABELS = {
      // what pressing will do, not what the current state is
      toNotebook: label ? label.textContent.trim() : '',
      toJournal: ''
    };
    // the other label is carried in a data attribute so both are localised
    LABELS.toJournal = btn.getAttribute('data-label-to-journal') || '';

    var team = {
      real: null,
      illustrated: null
    };
    // the Team page's own mode labels, if it is mounted
    var modeOpts = document.querySelectorAll('.ll-mode__opt');
    modeOpts.forEach(function (o) {
      if (o.dataset.mode === 'real') team.real = o.querySelector('span:last-child') ? o.querySelector('span:last-child').textContent.trim() : 'Photographs';
      if (o.dataset.mode === 'illustrated') team.illustrated = o.querySelector('span:last-child') ? o.querySelector('span:last-child').textContent.trim() : 'Illustrated';
    });

    function setTeamMode(mode) {
      // Use the Team page's own control when present; otherwise persist the
      // choice so the next visit to Team arrives in the matching mode.
      if (typeof window.__teamSetMode === 'function') {
        window.__teamSetMode(mode, true);
      }
      try { localStorage.setItem('mch_team_mode', mode); } catch (e) {}
    }

    function sync() {
      var skin = window.__wenlabSkin.current();
      var inNotebook = skin === NOTEBOOK;
      btn.setAttribute('aria-pressed', inNotebook ? 'true' : 'false');
      btn.classList.toggle('is-lit', inNotebook);
      if (label) label.textContent = inNotebook ? LABELS.toJournal : LABELS.toNotebook;

      var action = inNotebook ? 'academy' : 'manuscript';
      btn.setAttribute('aria-label',
        (inNotebook ? LABELS.toJournal : LABELS.toNotebook) +
        (btn.getAttribute('data-label-suffix') || ''));
      btn.title = btn.getAttribute('aria-label');
      btn.dataset.next = action;
    }

    btn.addEventListener('click', function () {
      var inNotebook = window.__wenlabSkin.current() === NOTEBOOK;

      btn.classList.remove('is-cast', 'is-settled');
      // re-trigger the animation on repeated presses
      void btn.offsetWidth;
      btn.classList.add(inNotebook ? 'is-settled' : 'is-cast');

      if (inNotebook) {
        window.__wenlabSkin.set(JOURNAL);
        setTeamMode('real');
      } else {
        window.__wenlabSkin.set(NOTEBOOK);
        setTeamMode('illustrated');
      }
      sync();
    });

    document.addEventListener('skinchange', sync);
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
