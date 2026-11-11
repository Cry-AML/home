/**
 * Wen Laboratory (文卓谦实验室) - Blowfish Interactive Engine
 * Ambient Living Canvas, Modals, Publications Filter, BibTeX & Smooth Navigation
 */

(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Global State & Theme Integration
  // ---------------------------------------------------------------------------
  let canvas, ctx, particles = [], animationFrameId;
  let mousePos = { x: -1000, y: -1000 };
  let isCanvasVisible = true;
  let lastActiveElement = null;

  // The ink wash only ever uses the three MD3 accents, read from the live
  // custom properties so the palette can never drift from the CSS.
  function readToken(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function getThemePaletteColors() {
    const isDark = document.documentElement.classList.contains('dark');
    const accent = readToken('--md-primary', isDark ? '#feb3b3' : '#a93441');
    const second = readToken('--md-secondary', isDark ? '#6dd7d6' : '#056969');
    const third = readToken('--md-tertiary', isDark ? '#f0be76' : '#7d5711');
    const ink = readToken('--md-on-surface', isDark ? '#efdfd8' : '#241914');
    return [accent, second, third, ink];
  }

  function updateCanvasThemeColors() {
    if (!particles.length) return;
    const colors = getThemePaletteColors();
    particles.forEach(p => {
      p.color = colors[Math.floor(Math.random() * colors.length)];
    });
  }

  // Blowfish owns light/dark. We only mirror its state onto the ink canvas.
  function syncCanvasToAppearance() {
    updateCanvasThemeColors();
  }

  // Kept as a no-op shim for any legacy inline handler.
  window.applyTheme = function () {
    syncCanvasToAppearance();
  };

  // Mirror Blowfish's appearance flips onto the ink palette.
  const appearanceObserver = new MutationObserver(() => syncCanvasToAppearance());
  appearanceObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // ---------------------------------------------------------------------------
  // 2. Modals Management (Global)
  // ---------------------------------------------------------------------------
  function trapFocus(modal) {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    modal.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    });
  }

  window.openAbstractFromEl = function(el) {
    if (!el || !el.dataset) return;
    window.openAbstractModal(
      el.dataset.abstractTitle || '',
      el.dataset.abstractJournal || '',
      el.dataset.abstractPmid || '',
      el.dataset.abstractText || ''
    );
  };

  window.openAbstractModal = function(title, journal, pmid, abstractText) {
    lastActiveElement = document.activeElement;
    const modal = document.getElementById('abstract-modal');
    if (!modal) return;
    
    const titleEl = document.getElementById('abstract-modal-title');
    const journalEl = document.getElementById('abstract-modal-journal');
    const pmidEl = document.getElementById('abstract-modal-pmid');
    const textEl = document.getElementById('abstract-modal-text');

    if (titleEl) titleEl.textContent = title || '';
    if (journalEl) journalEl.textContent = journal || '';
    if (pmidEl) pmidEl.textContent = pmid ? 'PMID: ' + pmid : '';
    if (textEl) textEl.textContent = abstractText || '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    const closeBtn = document.getElementById('close-abstract-modal');
    if (closeBtn) closeBtn.focus();
    trapFocus(modal);
  };

  window.closeAbstractModal = function() {
    const modal = document.getElementById('abstract-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  };

  // Close modals on Escape key
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAbstractModal();
  });

  // ---------------------------------------------------------------------------
  // 3. BibTeX Copy & Toast Notification (Global)
  // ---------------------------------------------------------------------------
  window.copyBibtex = function(bibtex, sourceEl) {
    if (!bibtex) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(bibtex);
    } else {
      const ta = document.createElement('textarea');
      ta.value = bibtex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // Inline feedback: the button itself flips to a confirmed state, and a
    // hand-drawn stamp lands on it. Falls back to the corner slip if the call
    // came from somewhere without a source element.
    if (sourceEl) {
      sourceEl.classList.add('is-copied');
      const original = sourceEl.textContent;
      sourceEl.textContent = '✓ Copied';
      setTimeout(() => {
        sourceEl.classList.remove('is-copied');
        sourceEl.textContent = original;
      }, 1500);
      stampOn(sourceEl, 'COPIED');
      return;
    }

    const toast = document.getElementById('toast-notification');
    if (toast) {
      toast.classList.remove('hidden', 'opacity-0', 'translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.classList.add('hidden'), 300);
      }, 2500);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Publications Filter & Live Search (Global)
  // ---------------------------------------------------------------------------
  window.filterPublications = function(filterCategory, btnEl) {
    document.querySelectorAll('.pub-filter-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const searchInput = document.getElementById('pub-search-input');
    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const cards = document.querySelectorAll('.publication-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category') || '';
      const isLandmark = card.getAttribute('data-landmark') === 'true';
      const text = card.textContent.toLowerCase();

      let matchFilter = false;
      if (filterCategory === 'all') matchFilter = true;
      else if (filterCategory === 'landmark') matchFilter = isLandmark;
      else matchFilter = (cardCat === filterCategory);

      const matchSearch = !term || text.includes(term);

      if (matchFilter && matchSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const countEl = document.getElementById('pub-count-display');
    if (countEl) countEl.textContent = visibleCount;
  };

  window.searchPublications = function(term) {
    const activeBtn = document.querySelector('.pub-filter-btn.active');
    const filterCat = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    filterPublications(filterCat, activeBtn);
  };

  // ---------------------------------------------------------------------------
  // 6. Ambient Living Canvas Simulator
  // ---------------------------------------------------------------------------
  function initAmbientCanvas() {
    canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;

    function resize() {
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      canvas.style.width = logicalWidth + 'px';
      canvas.style.height = logicalHeight + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? Math.min(Math.floor(window.innerWidth / 40), 20) : Math.min(Math.floor(window.innerWidth / 28), 50);
    const colors = getThemePaletteColors();

    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * logicalWidth,
        y: Math.random() * logicalHeight,
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function drawParticles(animate = true) {
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (animate) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = logicalWidth;
          if (p.x > logicalWidth) p.x = 0;
          if (p.y < 0) p.y = logicalHeight;
          if (p.y > logicalHeight) p.y = 0;

          const dx = mousePos.x - p.x;
          const dy = mousePos.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            p.x -= (dx / dist) * 0.7;
            p.y -= (dy / dist) * 0.7;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - cdist / 130) * 0.18;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    if (prefersReducedMotion) {
      drawParticles(false);
      return;
    }

    function loop() {
      if (isCanvasVisible) {
        drawParticles(true);
      }
      animationFrameId = requestAnimationFrame(loop);
    }
    loop();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(loop);
      }
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isCanvasVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(canvas);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Back-to-top index tab
  // ---------------------------------------------------------------------------
  function initBackToTop() {
    const tab = document.getElementById('scroll-to-top');
    if (!tab) return;

    let scheduled = false;
    const update = () => {
      const past = window.scrollY > window.innerHeight * 0.8;
      tab.classList.toggle('is-visible', past);
      tab.setAttribute('aria-hidden', past ? 'false' : 'true');
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  // ---------------------------------------------------------------------------
  // 8. Copy confirmation: a rubber stamp, not a toast far away
  // ---------------------------------------------------------------------------
  function stampOn(el, label) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const stamp = document.createElement('span');
    stamp.className = 'll-stamp-mark';
    stamp.textContent = label;
    stamp.style.left = `${rect.left + rect.width / 2}px`;
    stamp.style.top = `${rect.top}px`;
    document.body.appendChild(stamp);
    // force layout so the entry animation runs
    void stamp.offsetWidth;
    stamp.classList.add('is-inked');
    setTimeout(() => {
      stamp.classList.add('is-fading');
      setTimeout(() => stamp.remove(), 260);
    }, 1400);
  }

  // ---------------------------------------------------------------------------
  // 8b. Abstract disclosure — an inline accordion, not a modal
  // ---------------------------------------------------------------------------
  window.toggleAbstract = function (btn, id) {
    const panel = document.getElementById(id);
    if (!panel) return;
    const open = panel.dataset.open === 'true';
    if (open) {
      panel.dataset.open = 'false';
      btn.setAttribute('aria-expanded', 'false');
    } else {
      panel.dataset.open = 'true';
      btn.setAttribute('aria-expanded', 'true');
    }
  };

  // ---------------------------------------------------------------------------
  // 9. Timeline ink fill — the spine darkens as each entry reaches mid-screen
  // ---------------------------------------------------------------------------
  function initTimelineInk() {
    const nodes = [...document.querySelectorAll('.pedigree-node')];
    if (!nodes.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      nodes.forEach(n => {
        n.style.setProperty('--ink-progress', '1');
        n.classList.add('is-reached');
      });
      return;
    }

    let queued = false;
    const paint = () => {
      queued = false;
      const line = window.innerHeight * 0.62;
      nodes.forEach(node => {
        const r = node.getBoundingClientRect();
        // progress: 0 when the entry's top is below the line, 1 once its
        // bottom has passed it, interpolated in between.
        let p = (line - r.top) / Math.max(r.height, 1);
        p = Math.max(0, Math.min(1, p));
        node.style.setProperty('--ink-progress', p.toFixed(3));
        node.classList.toggle('is-reached', p > 0.35);
      });
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  }

  // ---------------------------------------------------------------------------
  // 10. Smooth Anchor Scrolling & Navigation
  // ---------------------------------------------------------------------------
  function initSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href === '#main-content') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // If mobile menu was open, close it
          const mobileToggle = document.getElementById('mobile-menu-toggle');
          if (mobileToggle && mobileToggle.checked) {
            mobileToggle.checked = false;
          }
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Robust Lifecycle Bootloader (Never Blank)
  // ---------------------------------------------------------------------------
  function init() {
    // 1. Ink palette follows the current appearance
    syncCanvasToAppearance();

    // 2. Initialize Canvas
    initAmbientCanvas();

    // 3. Back-to-top tab + smooth anchor scroll + timeline ink
    initBackToTop();
    initTimelineInk();
    initSmoothAnchorScroll();

    // 5. Search input listener
    const searchInput = document.getElementById('pub-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchPublications(this.value);
      });
    }

    // 6. Modal backdrop click
    const absModal = document.getElementById('abstract-modal');
    if (absModal) {
      absModal.addEventListener('click', function(e) {
        if (e.target === absModal) closeAbstractModal();
      });
    }

    // 7. Ensure all reveals are fully visible
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('is-revealed');
    });
  }

  // Canonical safe bootstrap (handles both before and after DOMContentLoaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
