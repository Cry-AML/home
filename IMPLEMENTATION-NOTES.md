# Implementation Notes — Design Audit Fix List (2026-11-10)

This document details the exact modifications applied across Phases A, B, and C in accordance with `docs/design-audit-2026-11-10.md`.

## Phase A (P0 Correctness)
- **A1. Missing CSS Classes (`assets/css/styles.css`)**: Defined `.theme-surface`, `.theme-transition`, and `.hero-gradient-overlay` tokens mapped to their respective CSS variables.
- **A2. Dark-Mode Contrast & Tokens (`assets/css/styles.css`, `index.html`)**:
  - Added `--text-on-primary: #ffffff;` for navy, crimson, and emerald themes.
  - Added `--text-on-primary: #04121f;` for `[data-theme="dark"]`.
  - Replaced `text-white` on `var(--primary)` CTAs in `index.html` with `color: var(--text-on-primary);`.
  - Updated `.pub-filter-btn.active` and `.platform-tab-btn.active` in `styles.css` to use `color: var(--text-on-primary) !important;`.
- **A3. Tailwind Dark Mode Config (`index.html`, `assets/js/main.js`)**:
  - Injected `<script>tailwind.config = { darkMode: 'class' };</script>` immediately following the Tailwind CDN script.
  - Added `document.documentElement.classList.toggle('dark', theme === 'dark');` in `setTheme()` and the inline `<head>` bootstrap script.
- **A4. Citation & Identifier Corrections (`assets/js/data.js`)**:
  - Corrected Blood 2023 PLK4 DOI to `10.1182/blood.2023019782`, PMID to `37738460`, updated citation string and BibTeX entry.
  - Corrected PMIDs for Adv Exp Med Biol 2023 (`38228958`), Leukemia 2022 (`35624145`), Blood 2022 proton (`34610101`), Blood 2015 SOX7 (`25940713`), Haematologica 2015 (`25820334`), Blood 2014 tescalcin (`24608976`), and Blood 2012 sorafenib (`22368270`).
  - Corrected Haematologica 2015 citation to volume 100(7):e250-e253, and updated its BibTeX entry with DOI.
- **A5. FOUC Prevention (`index.html`)**: Injected a blocking inline script at the top of `<head>` prior to stylesheets to load stored theme from `localStorage` ('wen_lab_theme') and sync dataset attributes and the `dark` class.

## Phase B (P1 Accessibility / Performance)
- **B1. Theme Dropdown Keyboard & Click Accessibility (`index.html`, `assets/js/main.js`)**:
  - Replaced hover-based menu with `<button id="theme-toggle" aria-haspopup="menu" aria-expanded="false">` and `<div id="theme-menu" role="menu">`.
  - Added click toggling, click-outside auto-close, option click auto-close, and Escape key dismissal with focus restoration to `#theme-toggle`.
- **B2. Stacking Context & Z-Index (`assets/css/styles.css`, `index.html`)**:
  - Adjusted `.film-grain` z-index from 999 down to 40.
  - Elevated `#abstract-modal` and `#figure-modal` to `z-[60]`.
  - Elevated `#toast-notification` to `z-[70]`.
- **B3. Semantic Accessibility Scaffolding (`index.html`, `assets/js/main.js`)**:
  - Injected an accessible skip link as first child of `<body>` targeting `#main`.
  - Wrapped primary document content between header and footer in `<main id="main">`.
  - Added `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` attributes to both modals.
  - Added `aria-label` to icon-only close buttons and mobile menu toggle.
  - Added Escape-to-close listener, modal focus trapping, and focus restoration to the triggering element.
- **B4. Focus Ring (`assets/css/styles.css`)**: Added global focus styling for `:focus-visible` on links, buttons, inputs, and tabindex targets using `outline: 2px solid var(--primary); outline-offset: 3px; border-radius: 6px;`.
- **B5. Living Canvas Performance & Motion Preferences (`assets/js/main.js`)**:
  - Scaled canvas resolution with `window.devicePixelRatio` and calibrated `ctx.scale`.
  - Respects `prefers-reduced-motion: reduce`: draws a single static frame without initiating requestAnimationFrame.
  - Added `visibilitychange` listener to pause animation loop when the browser tab is hidden.
  - Added `IntersectionObserver` on `#ambient-canvas` to pause execution when out of viewport.
  - Reduced particle density on viewport widths under 768px.
- **B6. Localization Enhancements (`assets/js/i18n.js`, `index.html`, `assets/js/main.js`)**:
  - Localized figure modal elements (`fig_modal_title`, `fig_panel_a`, `fig_panel_b`, `fig_thumb_alt`).
  - Localized hardcoded UI strings: figure showcase CTA, email label, campus building title, open in map CTA, postal code, and hospital adjacency note.
  - Updated `setLanguage()` to support HTML formatting and `<img>` alt attribute localization.
- **B7. Author Highlight Regex Safeguards (`assets/js/main.js`)**: Bounded author replacements (`\bMan CH(?![A-Za-z])`, `\bScadden DT\b`, `\bLeung AY(?![A-Za-z])`) to avoid corrupting adjacent names such as `Leung AYH`.
- **B8. Mobile Drawer Behavior (`index.html`, `assets/js/main.js`)**: Added `max-h-[calc(100vh-5rem)] overflow-y-auto` and auto-closing event listeners on navigation anchor clicks.
- **B9. Academic SEO & Highwire Metadata (`index.html`)**: Added `<link rel="canonical">` and Highwire Press `citation_*` meta tags for the flagship publication.
- **B10. Touch Target Sizing (`assets/css/styles.css`, `index.html`)**: Enforced minimum 44px hit heights on `.pub-filter-btn` and `.platform-tab-btn`, and 44x44px hit areas on modal close buttons.
- **B11. Typography Normalization (`index.html`, `assets/css/styles.css`)**: Removed `italic` from Chinese hero text and configured `.font-editorial` with `font-style: normal;`.

## Phase C (P2 Craft)
- **C1. Reading Prose Scale (`index.html`, `assets/js/main.js`)**: Adjusted body copy to `text-[15px] leading-[1.75]` in PI biography, research pillar cards, publication author/citation lines, news item descriptions, contact address, and join-us lead.
- **C2. Section Spacing Rhythm (`index.html`)**: Replaced uniform `py-24` on sections with responsive rhythm `py-14 sm:py-20 lg:py-28`.
- **C3. Scientific Stat Accuracy (`index.html`, `assets/js/i18n.js`)**: Replaced stat counters with exact figures: 5 Blood papers, 9 selected works, 1 Phase II trial, 2 top institutions (Harvard MGH · HKU).
- **C4. Progress Bar Smoothness (`assets/css/styles.css`)**: Removed conflicting CSS `transition: width 0.1s ease-out` on `#scroll-progress-bar`.
- **C5. Web Font Loading (`assets/css/styles.css`, `index.html`)**:
  - Removed render-blocking `@import` from `styles.css`.
  - Added preconnect tags and standard Google Fonts `<link>` tag in `<head>`.
  - Added CJK serif fallbacks (`'Songti SC', 'Noto Serif SC', Georgia, serif`) in `.font-editorial`.
- **C6. Scroll Reveal Choreography (`assets/css/styles.css`, `assets/js/main.js`)**:
  - Added `.reveal` and `.is-revealed` transitions in CSS with reduced-motion overrides.
  - Implemented `IntersectionObserver` in `main.js` targeting non-hero section wrappers.

## Items Not Completed / Blocked
- None. All tasks in Phases A, B, and C were completed in full and verified against the acceptance test suite (`docs/verify.sh` passed 61/61 checks).


---

## Post-review corrections by Codex (after independent verification)

The delegated agent's self-check passed, but independent review found 3 residual defects. These were fixed by Codex:

1. **`pi_title` missing from both dictionaries** (pre-existing since commit `58c6df8`) — English mode silently kept the Chinese "副教授 · 博士生导师 · 逸仙学者". Added `pi_title` to both `zh` and `en`.
2. **Keyword marquee ignored `prefers-reduced-motion`** — the infinite `.marquee-track` animation kept running for motion-sensitive users. Hardened the reduced-motion block to also stop the marquee and collapse all animation/transition durations.
3. **Pedigree timeline dot used `bg-white`** in JS templates — invisible on light surfaces / wrong ink on the dark theme. Replaced with `var(--text-on-primary)`.

Added `docs/verify.sh` (65 acceptance checks covering correctness, accessibility, craft, syntax and HTTP serving) — all green.
