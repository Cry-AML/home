/**
 * Medium-zoom initialization:
 * Transparent backdrop overlay (no content blocking / no dark mask).
 * Full viewport scaling preserving original natural expansion size.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof mediumZoom === 'function') {
    const zoom = mediumZoom(document.querySelectorAll("img:not(.nozoom)"), {
      margin: 16,
      background: "transparent",
      scrollOffset: 0,
    });

    // Remove the low-res clone when the uncompressed HD version arrives to eliminate ghosting
    zoom.on('opened', function () {
      const openedImages = document.querySelectorAll('.medium-zoom-image--opened');
      if (openedImages.length > 1) {
        openedImages[0].style.opacity = '0';
      }
    });

    zoom.on('close', function () {
      const openedImages = document.querySelectorAll('.medium-zoom-image--opened');
      openedImages.forEach(img => { img.style.opacity = '1'; });
    });
  }
});
