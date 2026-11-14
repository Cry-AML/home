/**
 * Medium-zoom initialization and backdrop styling
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof mediumZoom === 'function') {
    const zoom = mediumZoom(document.querySelectorAll("img:not(.nozoom)"), {
      margin: 24,
      background: "rgba(0, 0, 0, 0.72)",
      scrollOffset: 0,
    });

    // When HD image loads, remove the low-res clone to eliminate ghosting & pixelation
    zoom.on('opened', function () {
      const openedImages = document.querySelectorAll('.medium-zoom-image--opened');
      if (openedImages.length > 1) {
        // First one is the low-res clone scaled up by CSS, second is zoomedHd
        openedImages[0].style.opacity = '0';
      }
    });

    zoom.on('close', function () {
      const openedImages = document.querySelectorAll('.medium-zoom-image--opened');
      openedImages.forEach(img => { img.style.opacity = '1'; });
    });
  }
});
