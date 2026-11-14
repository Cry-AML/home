/**
 * Medium-zoom initialization and backdrop styling
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof mediumZoom === 'function') {
    mediumZoom(document.querySelectorAll("img:not(.nozoom)"), {
      margin: 24,
      background: "rgba(0, 0, 0, 0.65)",
      scrollOffset: 0,
    });
  }
});
