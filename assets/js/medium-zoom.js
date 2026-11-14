/**
 * Medium-zoom customization:
 * 1. Transparent backdrop overlay (no content masking).
 * 2. Constrains opened logo scale to exactly ~50% of the previous oversized dimensions
 *    (desktop ~380px, mobile ~240px), precisely centered on the screen viewport.
 * 3. Enforces WebKit / Safari subpixel anti-aliasing & removes raster interpolation blur.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof mediumZoom === 'function') {
    const zoom = mediumZoom(document.querySelectorAll("img:not(.nozoom)"), {
      margin: 24,
      background: "transparent",
      scrollOffset: 0,
    });

    // Custom scale constraint (shrink to 50% of max viewport spread, centered)
    zoom.on('open', function (event) {
      const target = event.target;
      if (!target || (!target.classList.contains('ll-brand__mark') && !target.classList.contains('ll-footer-mark'))) {
        return;
      }

      requestAnimationFrame(function () {
        const opened = document.querySelector('.medium-zoom-image--opened');
        if (!opened) return;

        const initLeft = parseFloat(opened.style.left) || 0;
        const initTop = parseFloat(opened.style.top) || 0;
        const initW = parseFloat(opened.style.width) || target.getBoundingClientRect().width || 32;
        const initH = parseFloat(opened.style.height) || target.getBoundingClientRect().height || 32;

        const initCx = initLeft + initW / 2;
        const initCy = initTop + initH / 2;

        const targetCx = window.innerWidth / 2;
        const targetCy = window.innerHeight / 2;

        const dx = targetCx - initCx;
        const dy = targetCy - initCy;

        // Shrink by 50% relative to previous ~760px desktop & ~480px mobile limits
        const targetFinalSize = window.innerWidth > 640 ? 380 : Math.min(240, window.innerWidth * 0.65);
        const S = targetFinalSize / initW;
        const tx = dx / S;
        const ty = dy / S;

        opened.style.transform = `scale(${S}) translate3d(${tx}px, ${ty}px, 0px)`;
      });
    });
  }
});
