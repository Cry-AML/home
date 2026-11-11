#!/usr/bin/env python3
"""
Verify the Join Us mailto: links follow RFC 6068.

A mailto: URI is a URI, not an HTML form body. A space must be %20 and a body
line break must be %0D%0A. Go's `urlquery` (and therefore Hugo's `urlquery`)
applies the application/x-www-form-urlencoded rule instead, encoding a space
as "+". Mail clients decode the URI rather than a form, so they do not turn
"+" back into a space — the prefilled letter arrived as
"Dear+Dr.+Cheuk-Him+Man,".

This checks both encodings and decodes the body back to text so a regression
is reported in human terms.

Run after `hugo`:
    python3 tools/check-mailto.py
"""
import html
import pathlib
import re
import sys
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'

PAGES = {
    'en': PUBLIC / 'join' / 'index.html',
    'zh-cn': PUBLIC / 'zh-cn' / 'join' / 'index.html',
    'zh-tw': PUBLIC / 'zh-tw' / 'join' / 'index.html',
}

# Both the four position buttons and the bottom inquiry button.
LINK = re.compile(r'href="(mailto:[^"]+)"')

REQUIRED_PARTS = 5


def check(lang, path):
    problems = []
    if not path.exists():
        return [f'{lang}: {path.relative_to(PUBLIC)} missing']
    markup = path.read_text()
    urls = [html.unescape(m) for m in LINK.findall(markup)]

    if len(urls) != REQUIRED_PARTS:
        problems.append(f'{lang}: expected {REQUIRED_PARTS} mailto links, found {len(urls)}')

    for i, url in enumerate(urls, 1):
        if '?' not in url or 'body=' not in url:
            problems.append(f'{lang} #{i}: missing subject/body query')
            continue
        raw_body = url.split('body=', 1)[1]
        raw_subject = url.split('subject=', 1)[1].split('&body=', 1)[0]

        for label, raw in (('subject', raw_subject), ('body', raw_body)):
            # urlquery never emits a bare "+" for a literal plus (that is %2B),
            # so any "+" here is a space encoded the wrong way.
            if '+' in raw:
                problems.append(f'{lang} #{i}: {label} encodes spaces as "+" '
                                f'({raw.count("+")} occurrences)')
            if ' ' in raw:
                problems.append(f'{lang} #{i}: {label} has an unescaped space')

        if '%0D%0A' not in raw_body:
            problems.append(f'{lang} #{i}: body has no CRLF line breaks '
                            f'(RFC 6068 requires %0D%0A)')

        # Decode strictly: unquote, never treat "+" as a space.
        body = urllib.parse.unquote(raw_body)
        first = body.split('\r\n', 1)[0].strip()
        if '+' in first:
            problems.append(f'{lang} #{i}: greeting still contains "+": {first!r}')
        if not first:
            problems.append(f'{lang} #{i}: body is empty')

    return problems


# The bottom banner button must carry its own inquiry template, not the
# generic body reused from a position, and its subject must be localized.
INQUIRY_SUBJECT = {
    'en': 'Inquiry',
    'zh-cn': '咨询',
    'zh-tw': '諮詢',
}

BANNER_LINK = re.compile(r'href="(mailto:[^"]+)"\s+class="ll-btn ll-btn--marker"')


def check_banner(lang, path):
    problems = []
    m = BANNER_LINK.search(html.unescape(path.read_text()))
    if not m:
        return [f'{lang}: bottom banner mailto button not found']
    url = m.group(1)
    if 'subject=' not in url:
        return [f'{lang}: banner link has no pre-filled subject']
    subject = urllib.parse.unquote(url.split('subject=', 1)[1].split('&body=', 1)[0])
    want = INQUIRY_SUBJECT[lang]
    if want not in subject:
        problems.append(f'{lang}: banner subject is not localized ({subject!r})')
    return problems


# ---------------------------------------------------------------------------
# Sweep: no mailto anywhere in the built site may carry a raw space, a "+" for
# a space, or a bare %0A line break. This catches templates beyond Join that
# someone adds later, and the legacy static pages copied into public/.
# ---------------------------------------------------------------------------
ANY_LINK = re.compile(r'href="(mailto:[^"]*)"|href=(mailto:[^"\s>]+)')


def _match_url(m):
    return m.group(1) or m.group(2)


def sweep():
    problems = []
    for f in sorted(PUBLIC.rglob('*.html')):
        rel = f.relative_to(PUBLIC)
        for m in ANY_LINK.finditer(f.read_text(errors='ignore')):
            url = html.unescape(_match_url(m))
            if '?' not in url:
                continue  # bare mailto:addr needs no encoding
            query = url.split('?', 1)[1]
            if ' ' in query:
                problems.append(f'{rel}: raw space in mailto query ({url[:90]})')
            if '+' in query:
                problems.append(f'{rel}: "+" for space in mailto query ({url[:90]})')
            if '%0A' in query.replace('%0D%0A', ''):
                problems.append(f'{rel}: bare %0A line break ({url[:90]})')
    return problems


def sweep_legacy_js():
    """The pre-Hugo static site still ships two main.js files that build a
    mailto by hand. They are not part of the Hugo build, but they live on the
    branch and would reintroduce the bug if ever served."""
    problems = []
    for rel in ('assets/js/main.js', 'designs/wen-lab/assets/js/main.js'):
        path = ROOT / rel
        if not path.exists():
            continue
        js = path.read_text(errors='ignore')
        if 'mailto:' not in js:
            continue
        if '%0D%0A' not in js and 'crlf' not in js.lower() and "'\\r\\n'" not in js:
            problems.append(f'{rel}: builds a mailto body without CRLF normalisation')
    return problems


def main():
    if not PUBLIC.exists():
        sys.exit('public/ missing — run hugo first')

    problems = []
    for lang, path in PAGES.items():
        problems.extend(check(lang, path))
        problems.extend(check_banner(lang, path))
    problems.extend(sweep())
    problems.extend(sweep_legacy_js())

    for p in problems:
        print('FAIL', p)

    if problems:
        print(f'\n{len(problems)} mailto problem(s)')
        sys.exit(1)

    print(f'mailto links follow RFC 6068 in {len(PAGES)} languages '
          f'({REQUIRED_PARTS} links each, %20 spaces, %0D%0A breaks); '
          f'banner inquiry subjects localized')


if __name__ == '__main__':
    main()
