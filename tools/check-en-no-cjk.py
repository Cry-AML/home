#!/usr/bin/env python3
"""
Fail if any English page leaks Chinese text.

The English site is the default locale at `/`, so a stray CJK glyph there is
always a bug, never a translation choice. Two shapes of leak have already
shipped once each:

  · a template printing the `*Zh` field unconditionally (`{{ .captionZh }}`
    instead of `{{ cond $isEn .captionEn .captionZh }}`);
  · a per-language asset built through `resources.ExecuteAsTemplate` with a
    fixed output path, where all three locales shared whichever one happened
    to build first — the static HTML was correct but the script rewrote
    aria-labels in a different language at runtime.

The language switcher is excluded: listing "简体中文" / "繁體中文" is the point
of that control, and those names should stay in their own script.

Run after `hugo`:
    python3 tools/check-en-no-cjk.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'

CJK = re.compile(r'[\u4e00-\u9fff\u3400-\u4dbf]')

# The switcher is intentional. Everything else must be Latin.
SWITCHER = re.compile(
    r'<div class="?ll-langswitch.*?</div>|<details class="?ll-langmenu.*?</details>',
    re.S,
)

# Runtime-injected strings: scan the JS bundles actually referenced by the
# English pages, so a mis-localised ExecuteAsTemplate output is caught too.
SCRIPT_ATTR = re.compile(r'src="?(/home/[^" >]*\.js)')


def english_pages():
    for f in sorted(PUBLIC.rglob('*.html')):
        rel = f.relative_to(PUBLIC)
        if rel.parts and rel.parts[0] in {'zh-cn', 'zh-tw'}:
            continue
        yield f


def scan_html():
    problems = []
    for f in english_pages():
        html = f.read_text(errors='ignore')
        html = SWITCHER.sub('', html)
        # Report each distinct Chinese *run* once per file, not once per glyph
        # and not once per surrounding context: the same caption repeated in
        # several places is one bug, not twelve.
        reported = set()
        for run in re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf][\u4e00-\u9fff\u3400-\u4dbf｜，。、：；！？（）《》「」“”·\s]*', html):
            run = run.strip()
            if not run or run in reported:
                continue
            reported.add(run)
            problems.append(f'{f.relative_to(PUBLIC)}: {run}')
    return problems


def scan_scripts():
    problems = []
    seen = set()
    for f in english_pages():
        html = f.read_text(errors='ignore')
        for src in SCRIPT_ATTR.findall(html):
            if src in seen:
                continue
            seen.add(src)
            path = PUBLIC / src[len('/home/'):]
            if not path.exists():
                continue
            js = path.read_text(errors='ignore')
            # Only quoted string literals — comments may mention Chinese.
            for lit in re.findall(r'"([^"\\]{2,})"|\'([^\'\\]{2,})\'', js):
                text = lit[0] or lit[1]
                if CJK.search(text):
                    problems.append(f'{path.name}: "{text}"')
    return problems


def main():
    if not PUBLIC.exists():
        sys.exit('public/ missing — run hugo first')

    html_problems = scan_html()
    js_problems = scan_scripts()

    for p in html_problems:
        print(f'HTML  {p}')
    for p in js_problems:
        print(f'JS    {p}')

    total = len(html_problems) + len(js_problems)
    if total:
        print(f'\n{total} Chinese string(s) leaked into the English site')
        sys.exit(1)
    print('English site is free of Chinese text '
          f'({len(list(english_pages()))} pages, {len(set(SCRIPT_ATTR.findall("".join(f.read_text(errors="ignore") for f in english_pages()))))} scripts)')


if __name__ == '__main__':
    main()
