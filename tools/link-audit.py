#!/usr/bin/env python3
"""End-to-end link audit for the built site.

1. Resolves every internal href/src against the filesystem (including absolute
   URLs that point back at this deployment).
2. Serves `public/` and requests every distinct internal URL, asserting
   status < 400.
3. Reports external targets for a separate manual/live check (they cannot be
   asserted offline; see `--external`).

Usage:  python3 tools/link-audit.py [--external]
Exit code 0 == every internal link and asset is reachable.
"""
import glob
import http.client
import pathlib
import re
import sys
import threading
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path('public')
BASE = '/home/'
SITE = 'https://cry-aml.github.io'
REF = re.compile(r"""(?:href|src)=["']?([^"'\s>]+)""")


def collect():
    assets, outbound = set(), set()
    for pg in sorted(ROOT.glob('**/index.html')) + [ROOT / '404.html']:
        if not pg.exists():
            continue
        rel = '/' + str(pg.relative_to(ROOT))
        rel_dir = rel.rsplit('/', 1)[0] + '/'
        html = re.sub(r'<svg[\s\S]*?</svg>', '', pg.read_text(errors='ignore'))
        for m in REF.finditer(html):
            raw = m.group(1).strip()
            if not raw or raw.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:')):
                continue
            if raw.startswith('//'):
                continue
            if raw.startswith(('http://', 'https://')):
                if raw.startswith(SITE + BASE):
                    raw = raw[len(SITE):]
                else:
                    outbound.add(raw)
                    continue
            target = raw if raw.startswith('/') else urllib.parse.urljoin(rel_dir, raw)
            assets.add(target.split('#')[0].split('?')[0])
    return assets, outbound


def main():
    assets, outbound = collect()

    missing = []
    for t in sorted(assets):
        if not t.startswith(BASE):
            missing.append((t, 'outside baseURL'))
            continue
        f = ROOT / t[len(BASE):]
        if not (f.exists() or f.with_suffix('.html').exists() or (f / 'index.html').exists()):
            missing.append((t, 'not built'))

    if missing:
        for t, why in missing:
            print(f"  {why:16s} {t}")
        print(f"\n{len(missing)} broken reference(s)")
        return 1

    # Live HTTP check against the built output.
    handler = lambda *a, **k: SimpleHTTPRequestHandler(*a, directory=str(ROOT), **k)
    srv = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    conn = http.client.HTTPConnection('127.0.0.1', port, timeout=10)
    bad = []
    for t in sorted(assets):
        path = '/' + t[len(BASE):]
        conn.request('GET', path)
        resp = conn.getresponse()
        resp.read()
        if resp.status >= 400:
            bad.append((resp.status, t))
    srv.shutdown()

    if bad:
        for st, t in bad:
            print(f"  HTTP {st}  {t}")
        print(f"\n{len(bad)} URL(s) returned >= 400")
        return 1

    print(f"{len(assets)} internal refs, all resolve and return < 400")
    if '--external' in sys.argv and outbound:
        print(f"\n{len(outbound)} external targets (not asserted offline):")
        for u in sorted(outbound):
            print("   ", u)
    return 0


if __name__ == '__main__':
    sys.exit(main())
