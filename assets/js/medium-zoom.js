/**
 * Medium-zoom initialization:
 * Transparent backdrop overlay (no content blocking / no dark mask).
 * Full viewport scaling preserving original natural expansion size.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof mediumZoom === 'function') {
    mediumZoom(document.querySelectorAll("img:not(.nozoom)"), {
      margin: 24,
      background: "transparent",
      scrollOffset: 0,
    });
  }
});
