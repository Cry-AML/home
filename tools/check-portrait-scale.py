#!/usr/bin/env python3
"""
Keep the PI portrait and the member portraits in the same size class.

The PI's photograph appears in three places — the PI row on Team, the marginal
note on the homepage, and above the biography on Experience. It is one image,
so it should read as one image: not a thumbnail in one place and a full print
in another.

This has drifted once already: the PI row used a 140px column while a member
card in a three-column grid rendered at 379px, which made the person who runs
the lab look like a footnote beside everyone else. The fix was a single token,
--ll-portrait-w, shared by the PI row and the hero; the academy skin then
briefly re-stretched the PI to a 1.55fr column, which this also guards.

The check is deliberately about the *rule*, not a rendered pixel: layout is
verified in the browser suite, and asserting exact pixels here would break on
every font-metric change. What must not silently return is a PI column that is
independent of the shared token.

Run from the repo root:
    python3 tools/check-portrait-scale.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CUSTOM = ROOT / 'assets' / 'css' / 'custom.css'
ACADEMY = ROOT / 'assets' / 'css' / 'themes' / 'academy.css'
TEAM = ROOT / 'layouts' / '_default' / 'team.html'
HOME = ROOT / 'layouts' / 'partials' / 'home' / 'custom.html'
PEDIGREE = ROOT / 'layouts' / '_default' / 'pedigree.html'

problems = []


def need(cond, msg):
    if not cond:
        problems.append(msg)


def main():
    custom = CUSTOM.read_text()
    academy = ACADEMY.read_text()

    # 1. the shared token exists and the PI row uses it
    need('--ll-portrait-w:' in custom,
         'custom.css: --ll-portrait-w token is gone; the PI and member sizes '
         'are no longer tied together')
    need(re.search(r'\.ll-pi-row\s*\{[^}]*grid-template-columns:\s*var\(--ll-portrait-w\)',
                   custom) is not None,
         'custom.css: .ll-pi-row no longer sizes its first column from '
         '--ll-portrait-w')

    # 2. The *base* .ll-pi-row must size the portrait from the token. A
    #    responsive override may restate it (a narrower fixed value at a
    #    breakpoint is fine, and so is a single-column stack), but a
    #    proportional column at the base would let the portrait float free of
    #    the member cards again.
    base = re.search(r'\n\.ll-pi-row\s*\{([^}]*)\}', custom)
    need(base is not None, 'custom.css: .ll-pi-row is gone')
    if base:
        body = base.group(1)
        need(re.search(r'grid-template-columns:\s*var\(--ll-portrait-w\)', body)
             is not None,
             'custom.css: base .ll-pi-row does not size its first column from '
             '--ll-portrait-w')
        need(re.search(r'grid-template-columns:\s*minmax\(0,\s*[\d.]+fr\)', body)
             is None,
             'custom.css: base .ll-pi-row uses a proportional portrait column')

    acad = re.search(r'\[data-theme="academy"\]\s*\.ll-pi-row\s*\{([^}]*)\}', academy)
    need(acad is not None, 'academy.css: no .ll-pi-row override')
    if acad:
        need('var(--ll-portrait-w)' in acad.group(1),
             'academy.css: .ll-pi-row does not inherit the shared portrait width')
        need(re.search(r'minmax\(0,\s*[\d.]+fr\)\s*minmax', acad.group(1)) is None,
             'academy.css: .ll-pi-row uses a proportional portrait column')

    # 3. all three placements render through the same frame
    team = TEAM.read_text()
    need('ll-person ll-person--pi' in team,
         'team.html: the PI is not rendered through .ll-person--pi')

    home = HOME.read_text()
    need('ll-person--hero' in home,
         'home/custom.html: no PI portrait on the homepage')
    need('ll-person ll-person--pi' in home,
         'home/custom.html: the homepage portrait does not reuse the PI frame')

    ped = PEDIGREE.read_text()
    need('ll-person--bio' in ped,
         'pedigree.html: no PI portrait on the Experience page')
    need('ll-person ll-person--pi' in ped,
         'pedigree.html: the Experience portrait does not reuse the PI frame')

    # 4. every placement carries both layers, so the illustrated flip works
    for label, txt in (('team.html', team), ('home/custom.html', home),
                       ('pedigree.html', ped)):
        need('ll-person__img--art' in txt,
             f'{label}: PI portrait has no illustrated layer')

    # 5. the illustrated layer must not eat the flip click (the Chrome bug)
    art = re.search(r'\.ll-person__img--art\s*\{([^}]*)\}', custom)
    need(art is not None and 'pointer-events: none' in art.group(1),
         'custom.css: .ll-person__img--art lost pointer-events:none')

    if problems:
        for p in problems:
            print('FAIL', p)
        print(f'\n{len(problems)} portrait-scale problem(s)')
        sys.exit(1)

    print('PI portrait and member portraits share one size token; '
          'all three placements use the same frame with both layers')


if __name__ == '__main__':
    main()
