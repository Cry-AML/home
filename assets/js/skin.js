/**
 * Wen Laboratory — the two skins.
 *
 * The site has one DOM and one stylesheet. Everything that differs between the
 * notebook and the institutional journal is expressed as a variable override
 * keyed on `[data-theme]` on <html>. This file only flips that attribute; it
 * never touches markup, so both skins stay honest to the same content.
 *
 * Runs synchronously in <head>, before the first paint, so a reader who chose
 * "academy" does not see the manuscript skin flash on every navigation.
 */
(function () {
  'use strict';

  var KEY = 'wenlab-skin';
  var DEFAULT = 'manuscript';

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'manuscript' || v === 'academy') return v;
    } catch (e) {}
    return DEFAULT;
  }

  function apply(skin) {
    // A skin change is not a page load, but the notebook skin's sheets carry an
    // entry animation (`ll-sheet-drop`) that replays the moment the attribute
    // flips back: the sheet starts at rotate(-1.9 * tilt) and swings to its
    // resting tilt. Under a View Transition the replay is delayed until the
    // snapshot is released, so the reader sees the page arrive, settle, and then
    // visibly twist. The class below suppresses that replay for one frame.
    var root = document.documentElement;
    // A class toggled on and then off will always restart a CSS animation on
    // removal — which is the bug, not the fix. The suppression is therefore
    // permanent for the life of the document: once the reader has changed skins,
    // the sheets are already on screen and must never drop in again. A real page
    // load clears it naturally, because nothing is carried across documents.
    root.classList.add('ll-skin-switched');

    root.setAttribute('data-theme', skin);
    try { localStorage.setItem(KEY, skin); } catch (e) {}
    // Announce the change. With View Transitions the mutation happens inside
    // an async callback, so anything that mirrors the state cannot just read
    // it back synchronously right after calling toggle().
    document.dispatchEvent(
      new CustomEvent('skinchange', { detail: { skin: skin } })
    );
  }

  // Set before paint.
  document.documentElement.setAttribute('data-theme', read());

  window.__wenlabSkin = {
    current: function () {
      return document.documentElement.getAttribute('data-theme') || DEFAULT;
    },
    /**
     * Cross-fade the whole document through a View Transition where the API
     * exists. The transition is skipped under prefers-reduced-motion, and the
     * switch still happens — the preference removes the animation, never the
     * function.
     */
    toggle: function () {
      var next = this.current() === 'academy' ? 'manuscript' : 'academy';
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!document.startViewTransition || reduced) {
        apply(next);
        return next;
      }
      document.startViewTransition(function () { apply(next); });
      return next;
    },
    set: apply
  };
})();
