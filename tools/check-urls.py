#!/usr/bin/env python3
"""Fail if a template builds a URL by branching on the language, which bypasses
Hugo's baseURL and 404s on a project-page deployment."""
import glob
import pathlib
import sys

PATTERNS = [
    'href="{{ if $isEn }}/',
    'href="{{ if .Site.Language',
    'src="{{ if $isEn }}/',
]

hits = []
for f in glob.glob('layouts/**/*.html', recursive=True):
    text = pathlib.Path(f).read_text()
    for pat in PATTERNS:
        if pat in text:
            hits.append((f, pat))

if hits:
    for f, pat in hits:
        print(f"{f}: {pat}")
    sys.exit(1)
print("no language-branched URL paths in templates")
