# Wen Laboratory Homepage — Award-Tier Audit & Fix Plan

- **Auditor (delegated):** Gemini 3.8 Flash (High) via `antigravity-bridge` MCP
- **Auditor (independent verification):** Codex — every claim below re-checked against source, PubMed/Crossref, and WCAG contrast math
- **Date:** 2026-11-10
- **Scope:** `index.html`, `assets/css/styles.css`, `assets/js/{data,i18n,main}.js`
- **Baseline commit:** `58c6df8`

---

## 1. Delegated audit score (Gemini 3.8 Flash, unedited)

| Dimension | Score | Verdict |
|---|---|---|
| Typography | 4/10 | 11–12px body copy everywhere; `italic` on Chinese glyphs; render-blocking `@import` |
| Whitespace | 5/10 | `py-24` (96px) on every section regardless of viewport |
| Visual Hierarchy | 4/10 | Hero stacks 6 competing anchors; PI name repeated 3× |
| Color | 3/10 | 2.14:1 dark-mode CTA; `dark:` variants are dead code |
| Motion | 4/10 | Canvas ignores reduced-motion, DPR, and tab visibility |
| Micro-interaction | 3/10 | Hover-only theme menu; no `:focus-visible`; no Escape/focus trap |
| Responsive | 4/10 | Sub-30px touch targets; drawer never auto-closes |
| Originality | 4/10 | 85% of content invisible to crawlers |

---

## 2. Independently verified defects (Codex re-check)

### P0 — must fix, provably broken

| # | Defect | Evidence | Impact |
|---|---|---|---|
| 1 | `.theme-surface`, `.theme-transition`, `.hero-gradient-overlay` are **never defined** in `styles.css` | `grep '^\.' styles.css` lists 13 classes, none of these. Used **25 / 31 / 1** times in `index.html` | Abstract modal, figure modal, dropdown, footer, nav, all section surfaces render **transparent**; `--hero-glow` never paints |
| 2 | Tailwind `dark:` variants are **dead code** | 24 occurrences in `index.html`, 15 in `main.js`; no `darkMode` config; Play CDN defaults to `media` | With `data-theme="dark"`, `text-slate-900` stays `#0f172a` on `#080c14` → **1.10:1** (unreadable). If OS is dark + theme navy → white on white |
| 3 | Dark theme CTA contrast **2.14:1** | `--primary:#38bdf8` + `text-white` on 4 CTAs and `.pub-filter-btn.active` | Fails WCAG AA (4.5) and even AA-large (3.0) |
| 4 | **Wrong DOI** for the Blood 2023 PLK4 paper | `data.js:188` = `10.1182/blood.2023020021` → Crossref **HTTP 404**. Correct: `10.1182/blood.2023019782` (PMID 37738460) | Dead link on the flagship publication |
| 5 | **8 of 9 PMIDs wrong** | Verified via NCBI E-utilities | Citation metadata corrupted |
| 6 | Haematologica 2015 issue/pages wrong | `data.js:282` says `100(10):e406-e410`; actual `100(7):e250-3` | Visible factual error |

Correct citation table (verified via PubMed esummary / Crossref):

| Paper | PMID (correct) | DOI (correct) | Vol(Issue):Pages |
|---|---|---|---|
| Nat Commun 2026 | 41942459 ✓ | 10.1038/s41467-026-71186-5 ✓ | 17(1) |
| Blood 2023 PLK4 | **37738460** (was 37756534) | **10.1182/blood.2023019782** (was .2023020021) | 142(23):2002-2015 |
| Adv Exp Med Biol 2023 | **38228958** (was 38166548) | 10.1007/978-981-99-7471-9_4 ✓ | 1442:45-64 |
| Leukemia 2022 | **35624145** (was 35688975) | 10.1038/s41375-022-01606-0 ✓ | 36(8):1990-2001 |
| Blood 2022 proton | **34610101** (was 34492695) | 10.1182/blood.2021011563 ✓ | 139(4):502-522 |
| Blood 2015 SOX7 | **25940713** (was 25934475) | 10.1182/blood-2014-06-580993 ✓ | 125(25):3928-3936 |
| Haematologica 2015 | **25820334** (was 26092787) | 10.3324/haematol.2014.123034 ✓ | **100(7):e250-e253** |
| Blood 2014 tescalcin | **24608976** (was 24599957) | 10.1182/blood-2013-07-512194 ✓ | 123(16):2530-2539 |
| Blood 2012 sorafenib | **22368270** (was 22496155) | 10.1182/blood-2011-06-363960 ✓ | 119(22):5133-5143 |

### P1 — award-tier blockers

| # | Defect | Evidence |
|---|---|---|
| 7 | Theme dropdown is `group-hover:block` only | Unusable on touch; no `aria-expanded`, no Escape, no outside-click |
| 8 | `.film-grain` `z-index:999` sits **above** modals (`z-50`) | Noise overlays modal text and the microscopy figure |
| 9 | No `<main>`, no skip-link, no `role="dialog"`/`aria-modal`, no `aria-label` on icon-only buttons | 0 hits for all six patterns |
| 10 | No `:focus-visible` anywhere | Keyboard users lose their place |
| 11 | Canvas ignores `prefers-reduced-motion`, `devicePixelRatio`, `document.hidden` | 0 hits for all three; blurry on Retina, drains battery |
| 12 | Figure-modal copy + 6 UI strings hardcoded Chinese | English mode leaves half the modal untranslated |
| 13 | Author highlight regex `/Leung AY/g` corrupts `Leung AYH` → `<strong>Leung AY</strong>H` | `main.js:345-349` vs `data.js:165` |
| 14 | No inline theme bootstrap → FOUC | `localStorage` theme applied only on `DOMContentLoaded` |
| 15 | Mobile drawer never closes on anchor tap | `main.js` mobile handler toggles only |
| 16 | No Highwire `citation_*` meta tags; body content is JS-only | Google Scholar / Baidu cannot index the 9 papers |
| 17 | Touch targets 18–30px | WCAG 2.5.5 requires 44px |
| 18 | `italic` on Chinese hero heading | Artificial shear on 方块字; violates CJK typographic norms |

### P2 — craft

| # | Defect |
|---|---|
| 19 | 55× `text-xs` (12px), 5× `text-[11px]` — body copy below 14px |
| 20 | 6 sections all use fixed `py-24` |
| 21 | Hero claims “10+ 篇” vs. 9 entries in the data file |
| 22 | Scroll progress bar has a CSS `transition` fighting the scroll event |
| 23 | No scroll-reveal choreography; no active-section nav indicator |
| 24 | Contact email hardcoded 6× (single source of truth missing) |
| 25 | `@import` in CSS is render-blocking and unreachable from mainland China |

### Explicitly **not** a bug (audit claim rejected)

- “i18n `textContent` destroys nested `<span>`/`<i>`” — **0** `data-i18n` elements contain nested markup; every icon sits in a **sibling** node. No change required. (Guard added anyway: fallback to `innerHTML` only when the dictionary value legitimately contains markup.)

---

## 3. Fix plan (implementation order)

### Phase A — correctness (P0)
1. Define `.theme-surface`, `.theme-transition`, `.hero-gradient-overlay` in `styles.css`.
2. `tailwind.config = { darkMode: 'class' }` + sync `documentElement.classList.toggle('dark')` in bootstrap and `setTheme()`.
3. Add `--text-on-primary` token (`#fff` for navy/crimson/emerald, `#04121f` for dark) and use it on all `var(--primary)` CTAs and active pills.
4. Correct the DOI, 8 PMIDs, and the Haematologica citation in `data.js`; regenerate BibTeX for the corrected entries.

### Phase B — accessibility & performance (P1)
5. Rebuild the theme menu as a real button + `role="menu""`, click/Escape/outside-click, `aria-expanded`.
6. Drop `.film-grain` to `z-index: 40`; raise modals to `z-[60]`.
7. Add skip-link, `<main>`, `role="dialog"`/`aria-modal`/`aria-labelledby`, Escape-to-close, focus trap + focus restore, `aria-label` on icon buttons.
8. Global `:focus-visible` ring.
9. Canvas: DPR scaling, `IntersectionObserver` pause when hero is off-screen, `visibilitychange` pause, `prefers-reduced-motion` → static frame.
10. Localize the figure modal and the 6 hardcoded strings; add `data-i18n`.
11. Bound the author regex: `/\bLeung AY(?!H)\b/g`, `/\bMan CH(?![A-Z])/g`, keep footnote markers outside the strong tag.
12. Inline theme bootstrap in `<head>` (before stylesheet) to kill FOUC.
13. Auto-close mobile drawer on anchor click.
14. Add Highwire `citation_*` meta + `canonical`.
15. Bump interactive controls to ≥44px hit area (visual size may stay small via padding).
16. Remove `italic` from the Chinese hero line.

### Phase C — craft (P2)
17. Type scale: prose → 15px (`text-[15px]`/`leading-[1.75]`), metadata → 12px only.
18. Responsive section rhythm: `py-14 sm:py-20 lg:py-28`.
19. Honest stats: `5` Blood papers, `9` selected works, `1` Phase II trial, `2` top-tier institutions.
20. Remove the progress-bar transition; add active-section nav highlight via `IntersectionObserver`.
21. Move fonts from `@import` to `<link rel="preconnect">` + `<link rel="stylesheet">`, with CJK serif fallback (`'Songti SC', 'Noto Serif SC', Georgia, serif`).
22. Scroll-reveal: `IntersectionObserver` adds `.is-revealed`, CSS handles `opacity`/`translateY`, disabled under reduced-motion.
