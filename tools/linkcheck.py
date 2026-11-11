#!/usr/bin/env python3
"""Resolve every internal link and asset reference in the built site against
the filesystem. Usage: python3 tools/linkcheck.py"""
import re
import sys
import glob
import pathlib
import urllib.parse

ROOT = pathlib.Path('public')
BASE = '/home/'  # GitHub Pages sub-path

# Both `href="…"`, `href='…'` and unquoted `href=…`
REF = re.compile(r"""(?:href|src)=["']?([^"'\s>]+)""")

pages = sorted(ROOT.glob('**/index.html'))
failures = []
checked = 0

for pg in pages:
    rel = '/' + str(pg.relative_to(ROOT))
    rel_dir = rel.rsplit('/', 1)[0] + '/'
    html = pg.read_text(errors='ignore')
    html = re.sub(r'<svg[\s\S]*?</svg>', '', html)
    for m in REF.finditer(html):
        raw = m.group(1).strip()
        if not raw or raw.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:')):
            continue
        SITE = 'https://cry-aml.github.io'
        if raw.startswith('//'):
            continue
        if raw.startswith(('http://', 'https://')):
            # absolute URLs that point back at this site must still resolve
            if not raw.startswith(SITE + BASE):
                continue
            raw = raw[len(SITE):]
        checked += 1
        target = raw if raw.startswith('/') else urllib.parse.urljoin(rel_dir, raw)
        target = target.split('#')[0].split('?')[0]
        if not target.startswith(BASE):
            failures.append((rel, raw, target, 'outside baseURL'))
            continue
        fs = ROOT / target[len(BASE):]
        if not (fs.exists() or fs.with_suffix('.html').exists() or (fs / 'index.html').exists()):
            failures.append((rel, raw, target, 'missing'))

print(f"internal refs checked: {checked}")
if failures:
    print(f"\nBROKEN ({len(failures)}):")
    seen = set()
    for page, raw, target, why in failures:
        key = (raw, target)
        if key in seen:
            continue
        seen.add(key)
        print(f"  {why:16s} {raw}\n     -> {target}\n     on {page}")
    sys.exit(1)
print("all internal links resolve")
