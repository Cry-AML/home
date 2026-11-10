/**
 * Wen Laboratory (文卓谦实验室) - Blowfish Interactive Engine
 * Ambient Living Canvas, Modals, Publications Filter, BibTeX & Smooth Navigation
 */

(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Global State & Theme Integration
  // ---------------------------------------------------------------------------
  let currentTheme = localStorage.getItem('wen_lab_theme') || 'navy';
  let canvas, ctx, particles = [], animationFrameId;
  let mousePos = { x: -1000, y: -1000 };
  let isCanvasVisible = true;
  let lastActiveElement = null;

  function getThemePaletteColors() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      // Radix Indigo & Emerald Dark Steps (8, 9, 10, 11)
      return ['#3d57d5', '#3e63dd', '#5472e4', '#9eb1ff', '#30a46c'];
    }
    // Radix Indigo & Emerald Light Steps (7, 8, 9, 10)
    return ['#3e63dd', '#3358d4', '#8da4ef', '#abbdf9', '#30a46c'];
  }

  function updateCanvasThemeColors() {
    if (!particles.length) return;
    const colors = getThemePaletteColors();
    particles.forEach(p => {
      p.color = colors[Math.floor(Math.random() * colors.length)];
    });
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('wen_lab_theme', theme);
    } catch (e) {}
    
    // Sync active state in UI
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      const isSelected = btn.getAttribute('data-theme-name') === theme;
      btn.classList.toggle('ring-2', isSelected);
      btn.classList.toggle('ring-sky-500', isSelected);
    });

    updateCanvasThemeColors();
  }

  // Expose applyTheme globally
  window.applyTheme = applyTheme;

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

  window.openFigureModal = function() {
    lastActiveElement = document.activeElement;
    const modal = document.getElementById('figure-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    const closeBtn = document.getElementById('close-figure-modal');
    if (closeBtn) closeBtn.focus();
    trapFocus(modal);
  };

  window.closeFigureModal = function() {
    const modal = document.getElementById('figure-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
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
    if (e.key === 'Escape') {
      closeFigureModal();
      closeAbstractModal();
    }
  });

  // ---------------------------------------------------------------------------
  // 3. BibTeX Copy & Toast Notification (Global)
  // ---------------------------------------------------------------------------
  window.copyBibtex = function(bibtex) {
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
  // 4. Platform Tabs Switcher (Global)
  // ---------------------------------------------------------------------------
  window.switchPlatformTab = function(platformId, btnEl) {
    document.querySelectorAll('.platform-tab-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    document.querySelectorAll('.platform-content-panel').forEach(panel => {
      if (panel.id === 'platform-' + platformId) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });
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
  // 7. Smooth Anchor Scrolling & Navigation
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
    // 1. Initial theme sync
    applyTheme(currentTheme);

    // 2. Initialize Canvas
    initAmbientCanvas();

    // 3. Smooth anchor scroll
    initSmoothAnchorScroll();

    // 4. Bind theme option buttons
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const theme = this.getAttribute('data-theme-name');
        applyTheme(theme);
      });
    });

    // 5. Search input listener
    const searchInput = document.getElementById('pub-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchPublications(this.value);
      });
    }

    // 6. Modal backdrop clicks
    const figModal = document.getElementById('figure-modal');
    if (figModal) {
      figModal.addEventListener('click', function(e) {
        if (e.target === figModal) closeFigureModal();
      });
    }
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
