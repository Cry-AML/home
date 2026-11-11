#!/usr/bin/env python3
"""Fail if any in-page anchor (#id) has no matching id on its own page."""
import glob
import pathlib
import re
import sys

bad = []
for page in glob.glob('public/**/index.html', recursive=True):
    html = pathlib.Path(page).read_text(errors='ignore')
    ids = set(re.findall(r"""id=["']?([^"'\s>]+)""", html))
    for anchor in set(re.findall(r"""href=["']?#([^"'\s>]+)""", html)):
        if anchor not in ids:
            bad.append((page, anchor))

if bad:
    for page, anchor in bad:
        print(f"dangling anchor #{anchor} on {page}")
    sys.exit(1)
print("no dangling in-page anchors")
