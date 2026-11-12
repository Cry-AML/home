/**
 * Wen Laboratory — keep the reader's place when the language changes.
 *
 * The language switcher is a real navigation: each locale has its own URL, so
 * choosing one loads a new document. Browsers restore scroll on history
 * traversal but not on a fresh navigation of this kind, so the reader who
 * switches from halfway down the Team page lands at the top of the translated
 * one — the most disorienting thing the site does.
 *
 * The position is remembered as a *fraction* of the page, not a pixel offset:
 * translated text is rarely the same height (a Chinese paragraph may run two
 * lines where the English ran three), so a stored 1200px could land in a
 * different section. A fraction keeps the reader at the same part of the
 * document, which is what "the same place" means when the words change.
 *
 * Restoration is only armed for a language switch — a normal link or a fresh
 * visit should still start at the top. The flag lives in sessionStorage so it
 * does not leak across tabs, and is consumed on use.
 */
(function () {
  'use strict';

  var KEY = 'wenlab-restore-scroll';
  var MAX_AGE = 10000; // a stale flag from a slow tab should not hijack a visit

  function store() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        y: window.scrollY,
        max: Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
        at: Date.now()
      }));
    } catch (e) {}
  }

  function restore() {
    var raw;
    try { raw = sessionStorage.getItem(KEY); } catch (e) { return; }
    if (!raw) return;
    try { sessionStorage.removeItem(KEY); } catch (e) {}

    var saved;
    try { saved = JSON.parse(raw); } catch (e) { return; }
    if (!saved || typeof saved.y !== 'number') return;
    if (Date.now() - saved.at > MAX_AGE) return;

    // The translated document is a different height, so the same fraction is
    // the honest equivalent of "the same place".
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var target = Math.round((saved.y / (saved.max || 1)) * max);
    if (target < 8) return;

    // Restore after layout and fonts have settled, or the target is computed
    // against a half-built page and lands short.
    var apply = function () {
      window.scrollTo({ top: target, left: 0, behavior: 'instant' });
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { requestAnimationFrame(apply); });
    } else {
      requestAnimationFrame(apply);
    }
    // A second pass covers images that reserve space late.
    window.addEventListener('load', function () { requestAnimationFrame(apply); }, { once: true });
  }

  function init() {
    // Only the language menu navigates with this intent; marking every anchor
    // would make ordinary browsing resume mid-page.
    document.querySelectorAll('.ll-langmenu__item, .ll-langswitch__opt').forEach(function (a) {
      a.addEventListener('click', store);
    });

    restore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
