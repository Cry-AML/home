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
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;';
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

  function drawOutline(host, seed) {
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

    const radius = 4;
    const pts = rectPts(pad, pad, w, h, 14);
    const drawn = wobblePath(pts, rng, 1.5);
    // Double stroke: the second pass barely offset reads as pen pressure.
    stroke(svg, smoothPath(drawn, true), { width: 1.35, opacity: 0.9 });
    const second = wobblePath(pts, rng, 1.15);
    stroke(svg, smoothPath(second, true), { width: 0.75, opacity: 0.42 });
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

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------
  const DRAWERS = {
    outline: drawOutline,
    underline: drawUnderline,
    circle: drawCircle,
    tally: drawTally,
    strike: drawStrike
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

  function drawAll(root) {
    (root || document).querySelectorAll('[data-ink]').forEach(mount);
  }

  // Redraw on resize (debounced) so paper outlines stay crisp
  let resizeTimer = null;
  const redrawAll = () => {
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
