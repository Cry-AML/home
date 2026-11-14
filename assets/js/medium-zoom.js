/**
 * Medium-zoom initialization and Safari crispness enhancer
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof mediumZoom === 'function') {
    mediumZoom(document.querySelectorAll("img:not(.nozoom)"), {
      margin: 24,
      background: "transparent",
      scrollOffset: 0,
    });

    const marks = document.querySelectorAll('.ll-brand__mark, .ll-footer-mark');
    marks.forEach(function (mark) {
      function applyCrispScale() {
        const opened = document.querySelector('.medium-zoom-image--opened');
        if (opened) {
          const targetFinalSize = window.innerWidth > 640 ? 380 : Math.min(240, window.innerWidth * 0.65);
          const targetLeft = (window.innerWidth - targetFinalSize) / 2;
          const targetTop = (window.innerHeight - targetFinalSize) / 2;

          opened.style.setProperty('width', targetFinalSize + 'px', 'important');
          opened.style.setProperty('height', targetFinalSize + 'px', 'important');
          opened.style.setProperty('left', targetLeft + 'px', 'important');
          opened.style.setProperty('top', targetTop + 'px', 'important');
          opened.style.setProperty('transform', 'none', 'important');
        }
      }

      mark.addEventListener('medium-zoom:open', function () {
        // Run continuously during the 300ms transition to override Safari's matrix-scale texture caching
        const start = Date.now();
        const animTimer = setInterval(function () {
          applyCrispScale();
          if (Date.now() - start > 400) clearInterval(animTimer);
        }, 16);
      });

      mark.addEventListener('medium-zoom:opened', applyCrispScale);
    });
  }
});
