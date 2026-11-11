#!/usr/bin/env python3
"""Fail if assets/css/custom.css has duplicate top-level rule blocks."""
import re
import sys
from collections import Counter
from pathlib import Path

src = Path('assets/css/custom.css').read_text()
src = re.sub(r'/\*[\s\S]*?\*/', '', src)

depth = 0
buf = ''
selectors = []
for ch in src:
    if ch == '{':
        if depth == 0:
            selectors.append(buf.strip())
        buf = ''
        depth += 1
    elif ch == '}':
        depth -= 1
        buf = ''
    elif depth == 0:
        buf += ch

# @font-face legitimately repeats once per weight; media queries may recur.
allowed = {'@font-face'}
dupes = {k: v for k, v in Counter(selectors).items()
         if v > 1 and k not in allowed and not k.startswith('@media') and k != ':root'}
if dupes:
    print("duplicate rule blocks:", dupes)
    sys.exit(1)
print(f"no duplicate rule blocks ({len(selectors)} rules)")
