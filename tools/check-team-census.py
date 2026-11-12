#!/usr/bin/env python3
"""
Verify the Team page renders the right number of people per group.

Seat *counts* are no longer printed (they read as inventory), so this checks the
structure instead: how many member cards each group renders, and whether a
group that is still recruiting ends on an open-desk card.

Counted from the built HTML by splitting on the group labels, because the
groups share one flat markup pattern and the label is the only thing that
separates them.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / 'public' / 'team' / 'index.html'

# label -> (expected members, expects an open-desk card at the end)
EXPECT = {
    'Ph.D. Candidates': (9, True),
    'M.Sc. Candidates': (2, True),
}


def section(html, label):
    i = html.find(label)
    if i < 0:
        return ''
    # the next group label, or the end of the people markup
    j = len(html)
    for other in EXPECT:
        k = html.find(other, i + len(label))
        if k > 0:
            j = min(j, k)
    return html[i:j]


def main():
    if not PAGE.exists():
        sys.exit('public/team/index.html missing — run hugo first')

    html = PAGE.read_text()
    problems = []

    for label, (people, wants_open) in EXPECT.items():
        chunk = section(html, label)
        if not chunk:
            problems.append(f'{label}: group not rendered')
            continue
        # count member cards by the article tag that opens each one;
        # `data-person-toggle` on the inner button would double-count
        n_people = len(re.findall(r'<article[^>]*\bdata-person\b(?!-)', chunk))
        n_open = len(re.findall(r'<a[^>]*\bclass=(?:"ll-seat"|ll-seat)\b', chunk))
        if n_people != people:
            problems.append(f'{label}: {n_people} member cards, expected {people}')
        if wants_open and n_open < 1:
            problems.append(f'{label}: no open-desk card, but the group is recruiting')

    # groups with nobody in them must not appear at all
    for absent in ('Postdoctoral', 'Interns'):
        if absent in html:
            problems.append(f'{absent}: a group with no members is being rendered')

    # seat counters must not be printed
    if 'll-sheet-count' in html:
        problems.append('seat counts are still displayed in the sheet header')

    if problems:
        for p in problems:
            print('FAIL', p)
        print(f'\n{len(problems)} team census problem(s)')
        sys.exit(1)

    print('team census correct: 9 + 1 open (doctoral), 2 + 1 open (master); '
          'empty groups hidden; no seat counters')


if __name__ == '__main__':
    main()
