#!/usr/bin/env python3
"""
Verify the two-skin system.

The site ships one DOM and one stylesheet. Everything that separates the
notebook from the institutional journal is a variable override keyed on
[data-theme] on <html>, plus a small script that flips that attribute before
first paint. This checks the pieces that make that promise true, and the
constraints that would silently rot if a later change forgot them:

  · the attribute is present and defaults to the notebook;
  · the academy layer is bundled after custom.css (it wins on specificity, not
    on !important discipline);
  · the academy rules actually cancel the notebook's surface cues — the paper
    sheet, the fluorescent chip, the sketched button — rather than merely
    recolouring them;
  · the journal palette contains none of the notebook's fluorescent cyan;
  · the theme is resolved before paint (the script is render-blocking), so a
    returning reader does not see the other skin flash.

Run after `hugo`:
    python3 tools/check-themes.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
CSS = ROOT / 'assets' / 'css' / 'themes' / 'academy.css'
CUSTOM = ROOT / 'assets' / 'css' / 'custom.css'
HEAD = ROOT / 'layouts' / 'partials' / 'head.html'
BASEOF = ROOT / 'layouts' / '_default' / 'baseof.html'
SWITCHER = ROOT / 'layouts' / 'partials' / 'header' / 'components' / 'skin-switcher.html'
JS = ROOT / 'assets' / 'js' / 'skin.js'

problems = []


def need(cond, msg):
    if not cond:
        problems.append(msg)


def block(selector):
    """Return the declaration block for an exact top-level selector."""
    s = CSS.read_text()
    i = s.find(selector + ' {')
    if i < 0:
        i = s.find(selector + '{')
    if i < 0:
        return ''
    j = s.find('}', i)
    return s[i:j]


def main():
    if not CSS.exists():
        sys.exit('assets/css/themes/academy.css missing')

    css = CSS.read_text()
    custom = CUSTOM.read_text()

    # --- wiring --------------------------------------------------------------
    # The default skin is the journal; the wand is how a reader reaches the
    # notebook. baseof must still carry an explicit attribute so the first paint
    # is never unstyled while skin.js resolves the stored choice.
    need('data-theme="academy"' in BASEOF.read_text(),
         'baseof.html: <html> has no data-theme default')
    need("var DEFAULT = 'academy'" in (ROOT / 'assets/js/skin.js').read_text(),
         'skin.js: DEFAULT must match baseof.html, or the first paint and the '
         'resolved state disagree')
    head = HEAD.read_text()
    need('css/themes/academy.css' in head, 'head.html: academy.css is not bundled')
    need(head.index('css/custom.css') < head.index('css/themes/academy.css'),
         'head.html: academy.css must load after custom.css')
    need('js/skin.js' in head, 'head.html: skin.js is not registered')
    # Locate the tag by the variable it renders; the src= is a template
    # expression, so the literal filename never appears in the tag itself.
    idx = head.find('$skinJS.RelPermalink')
    need(idx > 0, 'head.html: skin.js is not rendered into a <script> tag')
    if idx > 0:
        start = head.rfind('<script', 0, idx)
        end = head.find('>', idx)
        tag = head[start:end] if start > 0 else ''
        need('defer' not in tag and 'async' not in tag,
             'head.html: skin.js must be render-blocking, not deferred')

    # --- the switcher --------------------------------------------------------
    sw = SWITCHER.read_text() if SWITCHER.exists() else ''
    need('id="skin-menu"' in sw, 'skin-switcher.html: missing #skin-menu')
    need('<details' in sw, 'skin-switcher.html: must be a <details> menu')
    need('role="option"' in sw and 'aria-selected' in sw,
         'skin-switcher.html: menu items do not expose their selected state')
    need('data-skin-opt' in sw, 'skin-switcher.html: no skin options to choose')
    need('header/components/skin-switcher.html'
         in (ROOT / 'layouts/partials/header/basic.html').read_text(),
         'header/basic.html: switcher is not mounted')

    # --- the skin itself -----------------------------------------------------
    sheet = block('[data-theme="academy"] .ll-sheet')
    need('background-color: transparent' in sheet,
         'academy: .ll-sheet keeps its paper surface')
    need('box-shadow: none' in sheet, 'academy: .ll-sheet keeps its shadow')
    need('rotate: 0deg' in sheet, 'academy: .ll-sheet keeps its tilt')

    stamp = block('[data-theme="academy"] .ll-stamp')
    need('background-color: transparent' in stamp,
         'academy: .ll-stamp keeps a filled capsule')

    platform = block('[data-theme="academy"] .ll-platform')
    need('border-left: 2px solid' in platform,
         'academy: .ll-platform is missing the bronze left rule')
    need('border-radius: 0' in platform,
         'academy: .ll-platform keeps a rounded corner')

    marker = block('[data-theme="academy"] .ll-btn--marker')
    need('var(--ac-bronze)' in marker, 'academy: the primary button is not bronze')

    need("--font-hand: 'Newsreader'" in css,
         'academy: display type is not set in serif')
    need('html.dark[data-theme="academy"]' in css,
         'academy: no dark variant')
    need(re.search(r'\[data-theme="academy"\]\s*\.ll-hi', css) is not None,
         'academy: the marker highlight is not neutralised')

    # --- the switch must be visible and animated -----------------------------
    # The control sits at the far right of the bar, after the navigation, so it
    # reads as a display preference rather than another nav item.
    basic = (ROOT / 'layouts/partials/header/basic.html').read_text()
    need('header/components/skin-switcher.html' in basic,
         'header/basic.html: the skin switcher is not mounted')
    sw_pos = basic.index('header/components/skin-switcher.html')
    nav_pos = basic.index('header/components/desktop-menu.html')
    need(sw_pos > nav_pos,
         'header/basic.html: the switcher must come after the desktop menu')

    # The switch animates. A bare cross-fade (only a duration on both pseudo
    # elements) reads as a flicker; the journal layer must define a directional
    # wipe with its own keyframes.
    need('@keyframes ll-skin-in' in css,
         'academy.css: no keyframes for the incoming skin')
    need('@keyframes ll-skin-out' in css,
         'academy.css: no keyframes for the departing skin')
    need("clip-path: inset(0 0 100% 0)" in css,
         'academy.css: the incoming skin is not revealed by a wipe')
    need('::view-transition-new(root)' in css,
         'academy.css: the new-skin snapshot is not styled')
    # reduced motion must collapse the animation, not remove the transition
    need(re.search(r'prefers-reduced-motion[\s\S]{0,300}animation-duration:\s*1ms', css)
         is not None,
         'academy.css: reduced-motion must shorten the wipe, not disable the switch')

    # On narrow screens the switcher must still name the current skin rather
    # than reducing to two unexplained glyphs.
    # The trigger always states the current value; no width may reduce it to a
    # bare glyph.
    need('ll-skinmenu__cur' in sw,
         'skin-switcher.html: the trigger does not name the current skin')
    need(re.search(r'\.ll-skinmenu__pop', css) is not None,
         'academy.css: no popover rule for the skin menu')

    # --- left baseline: masthead, banner heading and body share one edge ---
    need('--ac-gutter' in css,
         'academy.css: no --ac-gutter token; full-bleed blocks will drift from .ui-container')
    for block_sel in ('.ui-container > .mb-8',
                      '.ll-team-head',
                      '.ll-page-head'):
        i = css.find(block_sel)
        seg = css[i:i + 700]
        need('var(--ac-gutter)' in seg,
             f'academy.css: banner padding for {block_sel} does not use --ac-gutter')

    # --- CJK must not be slanted ---
    need(':lang(zh) .ll-hi' in css or ':lang(zh-cn) .ll-hi' in css,
         'academy.css: the CJK highlight has no non-italic rule')

    # --- the current badge must not keep the sketched circle ---
    need('.ll-stamp--current' in css,
         'academy.css: the CURRENT badge is not restyled for the journal')
    need(re.search(r'\.ll-stamp--current\s*>\s*svg\[data-ll-ink\][\s\S]{0,80}display:\s*none',
                   css) is not None,
         'academy.css: the hand-drawn circle is still showing on CURRENT')

    # --- the animations this skin promises ---
    need('@keyframes' in css, 'academy.css: no keyframes at all')
    for js, what in (('journal-reveal.js', 'scroll choreography'),
                     ('canopy-light.js', 'canopy light'),
                     ('filter-marker.js', 'filter marker')):
        need((ROOT / 'assets' / 'js' / js).exists(),
             f'assets/js/{js} is missing ({what})')
        need(js in (ROOT / 'layouts/partials/extend-footer.html').read_text(),
             f'extend-footer.html: {js} is not loaded')
    need('--mouse-x' in css,
         'academy.css: the banner has no canopy gradient hook')
    need('.ll-chip-marker' in css,
         'academy.css: no filter marker styling')

    # --- M3 token parity: dark must define the same roles as light --------
    light_block = css[css.index('[data-theme="academy"] {'):]
    light_block = light_block[:light_block.index('\n}')]
    dark_i = css.index('html.dark[data-theme="academy"] {')
    dark_block = css[dark_i:css.index('\n}', dark_i)]
    light_tokens = set(re.findall(r'(--md-[a-z-]+):', light_block))
    dark_tokens = set(re.findall(r'(--md-[a-z-]+):', dark_block))
    missing = sorted(t for t in light_tokens - dark_tokens if not t.startswith('--md-shape')
                     and not t.startswith('--md-ease'))
    need(not missing,
         f'academy.css: dark mode does not define {missing} — those roles fall '
         f'back to the notebook palette and a foreign colour leaks in')

    # --- the shape scale is declared and used ------------------------------
    for tok in ('--md-shape-xs', '--md-shape-sm', '--md-shape-md'):
        need(tok in css, f'academy.css: shape token {tok} is not declared')
    need('border-radius: var(--md-shape' in css,
         'academy.css: the shape scale is declared but never used')

    # --- state layers ------------------------------------------------------
    need('opacity: 0.08' in css and 'opacity: 0.12' in css,
         'academy.css: M3 state layers (8% hover / 12% press) are missing')

    # --- the selected chip must not be deep forest -------------------------
    marker = re.search(r'\[data-theme="academy"\] \.ll-chip-marker \{([^}]*)\}', css)
    need(marker is not None and 'var(--md-secondary-container)' in marker.group(1),
         'academy.css: the selected filter chip is back on the deep masthead '
         'green instead of a soft container')

    # --- dropdown menu items must not inherit the nav-link rule -----------
    # `nav a` with !important beat the item's own .is-current rule and left the
    # selected language as pale-on-pale (1.3:1).
    nav_rule = re.search(r'\[data-theme="academy"\] \.main-menu nav > a,([^{]*)\{', css)
    need(nav_rule is not None and 'll-langmenu__item' in nav_rule.group(1),
         'academy.css: the nav-link rule is not scoped away from dropdown items')
    need('.ll-langmenu__item.is-current' in css,
         'academy.css: the selected dropdown item has no journal styling')

    # --- the trust strip numerals need a mode-aware colour ----------------
    need('--ac-stat' in css,
         'academy.css: no --ac-stat token; the strip numerals would use forest '
         'in dark mode and disappear')
    dark_roles_has_stat = '--ac-stat' in dark_block
    need(dark_roles_has_stat, 'academy.css: --ac-stat is not redefined for dark mode')

    # --- the Team page stack must share one left edge ---------------------
    # Sheets rotate about their centre by default, so a tall group sheet and a
    # short PI sheet put their left edges at different x. The corner pivot is
    # what holds the baseline, and it must stay scoped to Team (applied
    # globally it pulled standalone sheets outside the container inset).
    # the rule is shared by three selectors, so match any block that names the
    # people-sheet selector and check its body
    pivot = re.search(r'\.ll-sheet:has\(\.ll-people\)[^{]*\{([^}]*)\}', custom)
    need(pivot is not None and 'transform-origin: 0 0' in pivot.group(1),
         'custom.css: the people sheets lost their corner pivot; the PI and the '
         'group rows will drift apart')
    # and it must not be set on the shared .ll-sheet rule
    base_sheet = re.search(r'\n\.ll-sheet \{([^}]*)\}', custom)
    need(base_sheet is not None and 'transform-origin' not in base_sheet.group(1),
         'custom.css: transform-origin is applied to every sheet, which pulls '
         'standalone pages outside the gutter')

    # --- switching back must not replay the notebook's entry animation ----
    # A class toggled on then off restarts a CSS animation on removal, so the
    # suppression has to be permanent for the document. Without it the sheet
    # swings from rotate(-1.9x tilt) back to rest after the page has settled.
    skin_js = (ROOT / 'assets' / 'js' / 'skin.js').read_text()
    need('ll-skin-switched' in skin_js,
         'skin.js: no suppression class on skin change; the sheet entry '
         'animation will replay and the page will visibly twist')
    need(not re.search(r"classList\.remove\(\s*['\"]ll-skin-switched", skin_js),
         'skin.js: the suppression class is removed again, which restarts the '
         'very animation it exists to stop')
    need('ll-skin-switched .ll-sheet' in custom and
         'animation: none' in custom.split('ll-skin-switched .ll-sheet')[1][:120],
         'custom.css: no rule suppressing the sheet animation on a skin change')

    # --- mobile header controls must be legible on the green bar ----------
    # The desktop icon controls are `button.bf-icon-color-hover`; the mobile bar
    # uses Tailwind's text-neutral-900 on a <button> and a bare <label> for the
    # drawer, neither of which matched, so both rendered near-black on deep
    # green.
    need('#appearance-switcher-mobile' in css,
         'academy.css: the mobile theme toggle has no journal colour, so it '
         'renders near-black on the green bar')
    need('label[for="mobile-menu-toggle"]' in css,
         'academy.css: the mobile drawer trigger has no journal colour')
    need('label.bf-icon-color-hover' in css,
         'academy.css: the <label> variant of the icon control is not covered')

    # --- the surface scale must actually be defined ------------------------
    # --md-surface-container-high was referenced by six rules but never given a
    # value, so each of them painted transparent.
    # Both palettes must carry every surface step: a token defined only in the
    # light block paints transparent in dark mode and vice versa.
    light_block_c = custom[custom.index(':root {'):]
    light_block_c = light_block_c[:light_block_c.index('\n}')]
    dark_i_c = custom.index('html.dark {')
    dark_block_c = custom[dark_i_c:custom.index('\n}', dark_i_c)]
    for tok in ('--md-surface-container-high', '--md-surface-low',
                '--md-surface-container', '--md-surface-highest'):
        need(tok + ':' in light_block_c,
             f'custom.css: {tok} missing from the light palette (rules using it '
             f'paint transparent)')
        need(tok + ':' in dark_block_c,
             f'custom.css: {tok} missing from the dark palette')

    # --- the selected dropdown row must not use the loud state colour -----
    cur = re.search(r'\.ll-langmenu__item\.is-current[^{]*\{([^}]*)\}', css)
    need(cur is not None, 'academy.css: no styling for the selected dropdown item')
    if cur:
        need('--md-secondary-container' not in cur.group(1),
             'academy.css: the selected dropdown row is back on the palette\'s '
             'fluorescent state colour')

    # --- the wand is a two-way switch -------------------------------------
    wand_html = (ROOT / 'layouts/partials/wand.html').read_text()
    need('id="wand-toggle"' in wand_html, 'wand.html: no #wand-toggle')
    need('aria-pressed' in wand_html,
         'wand.html: the switch state is not exposed to assistive tech')
    need('data-label-to-journal' in wand_html,
         'wand.html: the return label is missing, so the button cannot say '
         'what pressing it will do')
    need('wand.html' in (ROOT / 'layouts/partials/extend-footer.html').read_text(),
         'extend-footer.html: the wand is not mounted')
    wand_js = (ROOT / 'assets/js/wand.js').read_text()
    need('set(JOURNAL)' in wand_js,
         'wand.js: never sets the journal back; the switch only goes one way')
    need('setTeamMode' in wand_js,
         'wand.js: does not drive the Team portraits')
    need("setTeamMode('real')" in wand_js and "setTeamMode('illustrated')" in wand_js,
         'wand.js: does not set the Team mode in both directions')
    # it must never retire itself any more
    need('removeChild' not in wand_js and 'is-gone' not in wand_js,
         'wand.js: the button removes itself, so it cannot be pressed again')
    need('.ll-wand.is-lit' in custom,
         'custom.css: no lit state for the wand, so on/off is only in the label')
    need('position: fixed' in custom.split('.ll-wand {')[1][:400],
         'custom.css: the wand is not fixed to the viewport')

    # --- language switch keeps the reader's place ------------------------
    lang_js_path = ROOT / 'assets' / 'js' / 'lang-scroll.js'
    need(lang_js_path.exists(),
         'assets/js/lang-scroll.js is missing; switching language returns the '
         'reader to the top of the page')
    need('lang-scroll.js' in (ROOT / 'layouts/partials/extend-footer.html').read_text(),
         'extend-footer.html: lang-scroll.js is not loaded')
    lang_js = lang_js_path.read_text()
    need('ll-langmenu__item' in lang_js,
         'lang-scroll.js: does not arm itself from the language menu, so the '
         'position is never stored')

    # --- logo proportions -------------------------------------------------
    # The mark must track the fluid title; a fixed size becomes 2x the type as
    # soon as the title steps down at 1024px.
    mark = re.search(r'\n\.ll-brand__mark \{([^}]*)\}', custom)
    need(mark is not None, 'custom.css: .ll-brand__mark is gone')
    if mark:
        need('clamp(' in mark.group(1),
             'custom.css: the header mark uses a fixed size and will drift out '
             'of proportion with the fluid wordmark')
    need('ll-footer-mark' in custom, 'custom.css: .ll-footer-mark is gone')

    # The fluorescent cyan must not survive into the journal skin as a *colour*.
    # Comments are stripped first: this file explains the decision to remove
    # that cyan by naming it, and a bare substring test would flag its own
    # rationale.
    css_no_comments = re.sub(r'/\*[\s\S]*?\*/', '', css)
    for bad in ('8bf4f2', '7CE7DF', '7ce7df'):
        need(bad.lower() not in css_no_comments.lower(),
             f'academy: fluorescent cyan {bad} still used as a colour')

    # --- the default must be untouched --------------------------------------
    # Academy styling belongs in the theme layer. A single component may carry
    # its own [data-theme="academy"] variant when the component itself is
    # defined in custom.css (the wand is), so count blocks rather than forbidding
    # the selector outright.
    academy_blocks = len(re.findall(r'\[data-theme="academy"\]', custom))
    need(academy_blocks <= 4,
         f'custom.css: {academy_blocks} academy rules leaked into the base '
         f'stylesheet; theming belongs in themes/academy.css')

    # --- the built page ------------------------------------------------------
    if PUBLIC.exists():
        index = (PUBLIC / 'index.html').read_text()
        need('data-theme=' in index, 'public/index.html: no data-theme on <html>')
        need('data-theme=academy' in index or 'data-theme="academy"' in index,
             'public/index.html: the default skin is not the journal')

    if problems:
        for p in problems:
            print('FAIL', p)
        print(f'\n{len(problems)} theme problem(s)')
        sys.exit(1)

    print('two skins wired correctly '
          '(journal default, notebook one press away, resolved before paint)')


if __name__ == '__main__':
    main()
