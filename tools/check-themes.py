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
    need('data-theme="manuscript"' in BASEOF.read_text(),
         'baseof.html: <html> has no data-theme="manuscript" default')
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
    need('id="skin-switcher"' in sw, 'skin-switcher.html: missing #skin-switcher')
    need('type="button"' in sw, 'skin-switcher.html: must be a <button>, not a link')
    need('aria-pressed' in sw, 'skin-switcher.html: pressed state is not exposed')
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
    need(re.search(r'max-width:\s*900px[\s\S]{0,200}\.ll-skin__name\s*\{\s*display:\s*inline',
                   css) is not None,
         'academy.css: narrow screens hide the skin name, leaving glyphs only')

    # the fluorescent cyan must not survive into the journal skin
    for bad in ('8bf4f2', '7CE7DF', '7ce7df'):
        need(bad.lower() not in css.lower(),
             f'academy: fluorescent cyan {bad} still present')

    # --- the default must be untouched --------------------------------------
    need('[data-theme="academy"]' not in custom,
         'custom.css: academy rules belong in themes/academy.css')

    # --- the built page ------------------------------------------------------
    if PUBLIC.exists():
        index = (PUBLIC / 'index.html').read_text()
        need('data-theme=' in index, 'public/index.html: no data-theme on <html>')
        need('data-theme=manuscript' in index or 'data-theme="manuscript"' in index,
             'public/index.html: default skin is not the notebook')

    if problems:
        for p in problems:
            print('FAIL', p)
        print(f'\n{len(problems)} theme problem(s)')
        sys.exit(1)

    print('two skins wired correctly '
          '(notebook default, journal overrides, resolved before paint)')


if __name__ == '__main__':
    main()
