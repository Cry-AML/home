#!/usr/bin/env python3
"""
Single source of truth for the deployment path prefix.

Reads `baseURL` from config/_default/hugo.toml so that moving the site between
a project page (`https://<user>.github.io/home/`) and an apex domain
(`https://manchlab.com/`) never requires editing any checker again.

    BASE  -> '/home/'            deployment path prefix, always trailing slash
    SITE  -> 'https://cry-aml.github.io'   scheme + host only
    ORIGIN-> 'https://cry-aml.github.io/home'  scheme + host + prefix, no slash
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONFIG = ROOT / 'config' / '_default' / 'hugo.toml'

_DEFAULT = 'https://cry-aml.github.io/home/'


def _read_base():
    if CONFIG.exists():
        m = re.search(r'^\s*baseURL\s*=\s*"([^"]+)"', CONFIG.read_text(), re.M)
        if m:
            return m.group(1)
    return _DEFAULT


def _parts(url):
    m = re.match(r'^(https?://[^/]+)(/.*)?$', url)
    if not m:
        return 'https://cry-aml.github.io', '/home/'
    site = m.group(1)
    path = m.group(2) or '/'
    if not path.startswith('/'):
        path = '/' + path
    if not path.endswith('/'):
        path += '/'
    return site, path


SITE, BASE = _parts(_read_base())
ORIGIN = (SITE + BASE).rstrip('/')
