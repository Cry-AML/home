/**
 * Wen Laboratory — Looseleaf Ink Engine
 * Deterministic seeded hand-drawn SVG ink (wobble, double-stroke, bleed)
 * Mirrors Looseleaf's seeded-ink architecture without the React runtime.
 *
 * Usage:
 *   <span data-ink="underline">text</span>
 *   <div data-ink="outline">…</div>
 *   <span data-ink="circle">…</span>
 *   <span data-ink="tally" data-tally="5"></span>
 *   <span data-ink="strike">…</span>
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Seeded PRNG (mulberry32) — deterministic across reloads and SSR
  // ---------------------------------------------------------------------------
  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rngFor = (key) => mulberry32(hashSeed(key));

  // Hand wobble: a low-frequency sinusoid + seeded noise, so a line never
  // looks machine-straight but also never jitters randomly on each frame.
  function wobblePath(pts, rng, amp) {
    const out = [];
    const freq = 0.9 + rng() * 0.5;
    const phase = rng() * Math.PI * 2;
    const drift = (rng() - 0.5) * amp * 0.35;
    for (let i = 0; i < pts.length; i++) {
      const t = i / (pts.length - 1 || 1);
      const wave = Math.sin(t * Math.PI * freq + phase) * amp;
      const noise = (rng() - 0.5) * amp * 0.6;
      out.push([pts[i][0] + (wave + noise) * 0.4, pts[i][1] + drift + (wave + noise) * 0.6]);
    }
    return out;
  }

  // Catmull-Rom → cubic Bézier for organic, ink-like curvature
  function smoothPath(pts, closed) {
    if (pts.length < 2) return '';
    const d = [];
    const n = pts.length;
    const get = (i) => pts[(i + n) % n];
    d.push(`M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`);
    const end = closed ? n : n - 1;
    for (let i = 0; i < end; i++) {
      const p0 = get(i - 1);
      const p1 = get(i);
      const p2 = get(i + 1);
      const p3 = get(i + 2);
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d.push(
        `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
      );
    }
    if (closed) d.push('Z');
    return d.join(' ');
  }

  function rectPts(x, y, w, h, step) {
    const pts = [];
    const push = (x1, y1, x2, y2) => {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const count = Math.max(2, Math.round(dist / step));
      for (let i = 0; i < count; i++) {
        const t = i / count;
        pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
      }
    };
    push(x, y, x + w, y);
    push(x + w, y, x + w, y + h);
    push(x + w, y + h, x, y + h);
    push(x, y + h, x, y);
    return pts;
  }

  // ---------------------------------------------------------------------------
  // Drawers
  // ---------------------------------------------------------------------------
  function svgEl(w, h) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('preserveAspectRatio', 'none');
    // The drawn layer sits immediately above the element's own background and
    // immediately below its text, so an inked edge never covers a label.
    svg.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:-1;';
    return svg;
  }

  function stroke(svg, d, opts) {
    const ns = 'http://www.w3.org/2000/svg';
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', opts.color || 'currentColor');
    p.setAttribute('stroke-width', String(opts.width || 1.4));
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    if (opts.opacity != null) p.setAttribute('opacity', String(opts.opacity));

    // Normalised path length, so the CSS draw-in works before the node is
    // ever attached to the document (getTotalLength() would return 0 here).
    if (!opts.noDraw) {
      p.setAttribute('pathLength', '1');
      p.setAttribute('stroke-dasharray', '1');
      p.setAttribute('stroke-dashoffset', '1');
      p.setAttribute('data-ink-draw', '');
    }

    svg.appendChild(p);
    return p;
  }

  // A rounded rectangle sampled as a point list, with per-corner radius so no
  // two corners of a sketched box ever match exactly.
  function roundedRectPts(x, y, w, h, radii, step) {
    const [r1, r2, r3, r4] = radii;
    const pts = [];
    const arc = (cx, cy, r, a0, a1) => {
      const n = Math.max(2, Math.round((Math.abs(a1 - a0) * r) / step));
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    };
    const line = (x1, y1, x2, y2) => {
      const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let i = 1; i < n; i++) {
        pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);
      }
    };
    // top edge →
    line(x + r1, y, x + w - r2, y);
    arc(x + w - r2, y + r2, r2, -Math.PI / 2, 0);
    // right edge ↓
    line(x + w, y + r2, x + w, y + h - r3);
    arc(x + w - r3, y + h - r3, r3, 0, Math.PI / 2);
    // bottom edge ←
    line(x + w - r3, y + h, x + r4, y + h);
    arc(x + r4, y + h - r4, r4, Math.PI / 2, Math.PI);
    // left edge ↑
    line(x, y + h - r4, x, y + r1);
    arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
    return pts;
  }

  function drawOutline(host, seed) {
    const w = host.offsetWidth;
    const h = host.offsetHeight;
    if (!w || !h) return null;
    const rng = rngFor(seed);
    const pad = 4;
    const svg = svgEl(w + pad * 2, h + pad * 2);
    svg.style.left = `${-pad}px`;
    svg.style.top = `${-pad}px`;
    svg.style.width = `${w + pad * 2}px`;
    svg.style.height = `${h + pad * 2}px`;

    // Per-corner radii, deliberately unequal: 6–14px, seeded.
    const rr = () => 6 + rng() * 8;
    const radii = [rr(), rr(), rr(), rr()];

    const pts = rectPts
      ? roundedRectPts(pad, pad, w, h, radii, 11)
      : (() => { const r = [4, 4, 4, 4]; return roundedRectPts(pad, pad, w, h, r, 11); })();

    // Pass 1 — the confident stroke. Wobble is larger than a ruled line's.
    const first = wobblePath(pts, rng, 2.1);
    // Run the path slightly past its start so the corner reads as overshoot.
    const overshoot = first.slice(0, 5).map(([x, y], i) => [x + (i + 1) * 0.35, y + Math.sin(i) * 0.4]);
    stroke(svg, smoothPath(first.concat(overshoot), false), {
      width: 1.9,
      opacity: 0.92,
      color: 'var(--ll-pencil)'
    });

    // Pass 2 — the lighter second pass that never quite retraces the first.
    const second = wobblePath(pts, rng, 1.5);
    stroke(svg, smoothPath(second, false), {
      width: 1.0,
      opacity: 0.4,
      color: 'var(--ll-pencil)'
    });

    // Pass 3 — a pressure swell on one edge, as if the nib was pressed harder.
    const edge = Math.floor(rng() * 4);
    const seg = first.filter(([x, y]) => {
      if (edge === 0) return y < pad + 6;
      if (edge === 1) return x > w + pad - 6;
      if (edge === 2) return y > h + pad - 6;
      return x < pad + 6;
    });
    if (seg.length > 3) {
      stroke(svg, smoothPath(seg, false), {
        width: 2.9,
        opacity: 0.22,
        color: 'var(--ll-pencil)'
      });
    }
    return svg;
  }

  function drawUnderline(host, seed) {
    const w = host.offsetWidth;
    const h = host.offsetHeight;
    if (!w) return null;
    const rng = rngFor(seed);
    const svg = svgEl(w + 8, 14);
    svg.style.left = '-4px';
    svg.style.top = `${h - 5}px`;
    svg.style.height = '14px';
    svg.style.width = `${w + 8}px`;

    const y = 6;
    const pts = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push([4 + t * w, y + Math.sin(t * Math.PI * 1.15) * 1.6 - 1.2 * t]);
    }
    const drawn = wobblePath(pts, rng, 1.1);
    stroke(svg, smoothPath(drawn, false), { width: 2.4, opacity: 0.85, noDraw: true });
    // Highlighter bleed underneath
    const bleedPts = wobblePath(pts.map(([x, yy]) => [x, yy + 2.5]), rng, 1.4);
    stroke(svg, smoothPath(bleedPts, false), {
      width: 4.5,
      opacity: 0.16,
      color: 'var(--ll-hi)',
      noDraw: true
    });
    return svg;
  }

  function drawCircle(host, seed) {
    const w = host.offsetWidth;
    const h = host.offsetHeight;
    if (!w || !h) return null;
    const rng = rngFor(seed);
    const pad = 6;
    const svg = svgEl(w + pad * 2, h + pad * 2);
    svg.style.left = `${-pad}px`;
    svg.style.top = `${-pad}px`;
    svg.style.width = `${w + pad * 2}px`;
    svg.style.height = `${h + pad * 2}px`;

    const cx = w / 2 + pad;
    const cy = h / 2 + pad;
    const rx = w / 2 + 1.5;
    const ry = h / 2 + 1;
    const pts = [];
    const steps = 34;
    const startA = -0.5 + rng() * 0.4;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = startA + t * Math.PI * 2 * 1.02;
      // organic ellipse: slight radius modulation
      const mod = 1 + Math.sin(a * 2.3 + rng() * 0.4) * 0.02;
      pts.push([cx + Math.cos(a) * rx * mod, cy + Math.sin(a) * ry * mod]);
    }
    const drawn = wobblePath(pts, rng, 1.5);
    stroke(svg, smoothPath(drawn, false), { width: 1.5, opacity: 0.9 });
    const over = wobblePath(pts.slice(0, 10), rng, 1.3);
    stroke(svg, smoothPath(over, false), { width: 0.9, opacity: 0.45 });
    return svg;
  }

  function drawTally(host, seed) {
    const count = parseInt(host.getAttribute('data-tally') || '5', 10);
    const w = host.offsetWidth || 24;
    const h = host.offsetHeight || 20;
    const rng = rngFor(seed);
    const svg = svgEl(w, h);
    const groups = Math.floor(count / 5);
    const rest = count % 5;
    const totalStrokes = groups * 5 + rest;
    const spacing = w / Math.max(totalStrokes, 1);
    let idx = 0;
    const drawStroke = (x, tall) => {
      const jitter = (rng() - 0.5) * 1.2;
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        pts.push([x + jitter + Math.sin(t * 3 + idx) * 0.5, 2 + t * (tall ? h - 6 : h - 9)]);
      }
      stroke(svg, smoothPath(wobblePath(pts, rng, 0.9), false), { width: 1.8, opacity: 0.88 });
      idx++;
    };
    for (let g = 0; g < groups; g++) {
      for (let i = 0; i < 4; i++) drawStroke(g * spacing * 5 + i * spacing + spacing * 0.5, true);
      // the crossing tally stroke
      const x0 = g * spacing * 5 + spacing * 0.15;
      const x1 = g * spacing * 5 + spacing * 4.85;
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        pts.push([x0 + (x1 - x0) * t, h - 3 - t * (h - 10)]);
      }
      stroke(svg, smoothPath(wobblePath(pts, rng, 1.2), false), { width: 1.6, opacity: 0.8 });
    }
    for (let i = 0; i < rest; i++) drawStroke(groups * spacing * 5 + i * spacing + spacing * 0.5, true);
    return svg;
  }

  function drawStrike(host, seed) {
    const w = host.offsetWidth;
    const h = host.offsetHeight;
    if (!w) return null;
    const rng = rngFor(seed);
    const svg = svgEl(w + 6, h);
    svg.style.left = '-3px';
    const y = h * 0.52;
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push([3 + t * w, y + Math.sin(t * Math.PI) * -1.4]);
    }
    stroke(svg, smoothPath(wobblePath(pts, rng, 1.1), false), { width: 1.6, opacity: 0.85 });
    return svg;
  }

  // A sketched card edge: three passes, generous corner radii, pressure swell.
  function drawSheet(host, seed) {
    const w = host.offsetWidth;
    const h = host.offsetHeight;
    if (!w || !h) return null;
    const rng = rngFor(seed);
    const pad = 5;
    const svg = svgEl(w + pad * 2, h + pad * 2);
    svg.style.left = `${-pad}px`;
    svg.style.top = `${-pad}px`;
    svg.style.width = `${w + pad * 2}px`;
    svg.style.height = `${h + pad * 2}px`;

    // Big, uneven corner radii read as a hand-drawn panel rather than a card.
    const rr = () => 10 + rng() * 12;
    const radii = [rr(), rr(), rr(), rr()];
    const pts = roundedRectPts(pad, pad, w, h, radii, 13);

    const first = wobblePath(pts, rng, 2.4);
    const tail = first.slice(0, 6).map(([x, y], i) => [x + (i + 1) * 0.4, y - Math.sin(i) * 0.5]);
    stroke(svg, smoothPath(first.concat(tail), false), {
      width: 1.6,
      opacity: 0.55,
      color: 'var(--ll-pencil)'
    });

    const second = wobblePath(pts, rng, 1.6);
    stroke(svg, smoothPath(second, false), {
      width: 0.9,
      opacity: 0.3,
      color: 'var(--ll-pencil)'
    });

    // One edge carries more ink, as if the pen lingered there.
    const edge = Math.floor(rng() * 4);
    const seg = first.filter(([x, y]) => {
      if (edge === 0) return y < pad + 8;
      if (edge === 1) return x > w + pad - 8;
      if (edge === 2) return y > h + pad - 8;
      return x < pad + 8;
    });
    if (seg.length > 4) {
      stroke(svg, smoothPath(seg, false), {
        width: 3.2,
        opacity: 0.12,
        color: 'var(--ll-pencil)'
      });
    }
    return svg;
  }

  // A tight sketched edge for controls — one confident pass plus a ghost.
  function drawEdge(host, seed) {
    const w = host.offsetWidth;
    const h = host.offsetHeight;
    if (!w || !h) return null;
    const rng = rngFor(seed);
    const pad = 3;
    const svg = svgEl(w + pad * 2, h + pad * 2);
    svg.style.left = `${-pad}px`;
    svg.style.top = `${-pad}px`;
    svg.style.width = `${w + pad * 2}px`;
    svg.style.height = `${h + pad * 2}px`;

    const rr = () => 4 + rng() * 4;
    const pts = roundedRectPts(pad, pad, w, h, [rr(), rr(), rr(), rr()], 9);

    const first = wobblePath(pts, rng, 1.5);
    stroke(svg, smoothPath(first, false), {
      width: 1.55,
      opacity: 0.9,
      color: 'currentColor'
    });
    const second = wobblePath(pts, rng, 1.1);
    stroke(svg, smoothPath(second, false), {
      width: 0.7,
      opacity: 0.32,
      color: 'currentColor'
    });
    return svg;
  }

  // A filled marker blot behind a label — the wet-ink button ground.
  function drawBlob(host, seed) {
    const w = host.offsetWidth;
    const h = host.offsetHeight;
    if (!w || !h) return null;
    const rng = rngFor(seed);
    const pad = 3;
    const svg = svgEl(w + pad * 2, h + pad * 2);
    svg.style.left = `${-pad}px`;
    svg.style.top = `${-pad}px`;
    svg.style.width = `${w + pad * 2}px`;
    svg.style.height = `${h + pad * 2}px`;

    const rr = () => 5 + rng() * 5;
    const pts = roundedRectPts(pad, pad, w, h, [rr(), rr(), rr(), rr()], 10);
    const drawn = wobblePath(pts, rng, 1.8);

    // Solid ink body: a hand-cut marker shape, not a rounded CSS rectangle.
    const ns = 'http://www.w3.org/2000/svg';
    const fill = document.createElementNS(ns, 'path');
    fill.setAttribute('d', smoothPath(drawn, true));
    fill.setAttribute('fill', 'currentColor');
    svg.appendChild(fill);

    // A second, slightly larger pass at low opacity fakes the felt edge bleed.
    const bleed = wobblePath(
      roundedRectPts(pad - 1, pad - 1, w + 2, h + 2, [rr(), rr(), rr(), rr()], 10),
      rng,
      1.9
    );
    const bleedPath = document.createElementNS(ns, 'path');
    bleedPath.setAttribute('d', smoothPath(bleed, true));
    bleedPath.setAttribute('fill', 'currentColor');
    bleedPath.setAttribute('opacity', '0.22');
    bleedPath.setAttribute('transform', 'translate(0.5 1)');
    svg.insertBefore(bleedPath, fill);

    return svg;
  }

  // A ruled divider: one long pencil pass with a slow bend and a lighter echo.
  function drawRule(host, seed) {
    const w = host.offsetWidth;
    if (!w) return null;
    const rng = rngFor(seed);
    const h = 10;
    const svg = svgEl(w, h);
    svg.style.left = '0';
    svg.style.top = '-4px';
    svg.style.height = `${h}px`;
    svg.style.width = `${w}px`;

    const pts = [];
    const steps = Math.max(8, Math.round(w / 26));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // a barely perceptible bow, tighter towards both ends
      const bow = Math.sin(t * Math.PI) * (1.1 + rng() * 0.7);
      pts.push([t * w, 5 + bow]);
    }
    const drawn = wobblePath(pts, rng, 0.85);
    stroke(svg, smoothPath(drawn, false), { width: 1.15, opacity: 0.5, color: 'var(--ll-pencil)' });
    const echo = wobblePath(pts, rng, 0.6);
    stroke(svg, smoothPath(echo, false), { width: 0.6, opacity: 0.26, color: 'var(--ll-pencil)' });
    return svg;
  }

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------
  const DRAWERS = {
    outline: drawOutline,
    underline: drawUnderline,
    circle: drawCircle,
    tally: drawTally,
    strike: drawStrike,
    sheet: drawSheet,
    edge: drawEdge,
    blob: drawBlob,
    rule: drawRule
  };

  function mount(host) {
    const kind = host.getAttribute('data-ink');
    const drawer = DRAWERS[kind];
    if (!drawer) return;
    if (host.querySelector(':scope > svg[data-ll-ink]')) return;

    const seed = host.getAttribute('data-ink-seed') || (kind + (host.textContent || '').trim());
    const svg = drawer(host, seed);
    if (!svg) return;
    svg.setAttribute('data-ll-ink', kind);
    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }
    host.appendChild(svg);
  }

  // Site components opt in automatically: paper gets a sketched panel edge,
  // outlined controls get a sketched edge, filled controls get a marker blot.
  function mountSiteComponents(root) {
    const scope = root || document;
    scope.querySelectorAll('.ll-sheet').forEach((el) => {
      if (!el.hasAttribute('data-ink')) el.setAttribute('data-ink', 'sheet');
    });
    scope.querySelectorAll('.ll-btn--outline, .ll-btn--xs').forEach((el) => {
      if (!el.hasAttribute('data-ink')) el.setAttribute('data-ink', 'edge');
    });
    scope.querySelectorAll('.ll-btn--marker').forEach((el) => {
      if (!el.hasAttribute('data-ink')) el.setAttribute('data-ink', 'blob');
    });
    scope.querySelectorAll('.ll-rule').forEach((el) => {
      if (!el.hasAttribute('data-ink')) el.setAttribute('data-ink', 'rule');
    });
  }

  function drawAll(root) {
    mountSiteComponents(root);
    (root || document).querySelectorAll('[data-ink]').forEach(mount);
  }

  // Redraw on resize (debounced) so paper outlines stay crisp
  let resizeTimer = null;
  const redrawAll = () => {
    mountSiteComponents();
    document.querySelectorAll('[data-ink]').forEach((host) => {
      const old = host.querySelector(':scope > svg[data-ll-ink]');
      if (old) old.remove();
      mount(host);
    });
  };

  function boot() {
    drawAll();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(redrawAll, 160);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.WenInk = { redraw: redrawAll, draw: drawAll };
})();
