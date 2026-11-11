#!/usr/bin/env python3
"""
Generate the Traditional Chinese data and content from the Simplified source.

Uses OpenCC's character-level cn -> tw conversion via opencc-js, then applies a
small terminology map for Taiwan usage. The phrase-level converter (twp) is
deliberately avoided: it rewrites 荧光 as 熒游, 干预 as 幹預, 激活 as 啟用 —
wrong for this text.

Two rules matter:
  · every Simplified *string value* is converted, whatever its key — including
    items inside `featuresZh` / `reqsZh` arrays;
  · English-only fields (`*En`, `authors`, `bibtex`, `doi`, …) are left alone.

Requires `opencc-js` — install once with:
    cd tools && npm i opencc-js
Run from the repo root:
    python3 tools/gen-zh-tw.py
"""
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OCC = ROOT / 'tools' / 'node_modules' / 'opencc-js'

# Keys whose values stay untouched: they are English, code, or identifiers.
SKIP_KEYS = {
    'nameEn', 'titleEn', 'institutionEn', 'officeEn', 'roleEn', 'instEn',
    'tagEn', 'descEn', 'statusEn', 'salaryEn', 'captionEn', 'abstractEn',
    'title', 'authors', 'bibtex', 'doi', 'doiUrl', 'pmid', 'citation',
    'impact', 'journal', 'id', 'icon', 'number', 'year', 'date', 'type',
    'category', 'image', 'highlightPaper', 'email', 'landmark', 'highlight',
    'roleNote', 'featuresEn', 'reqsEn',
}

# Taiwan-usage corrections that cn->twp does not make.
TERMS = [
    ('平臺', '平台'),
    ('計劃', '計畫'),
    ('軟件', '軟體'),
    ('網絡', '網路'),
    ('信息', '資訊'),
    ('數據庫', '資料庫'),
    ('實驗臺', '實驗桌'),
]


def converter(strings):
    # Batch everything through one node process; a per-string call would be
    # thousands of spawns for a file this size.
    script = (
        "const OpenCC=require('opencc-js');"
        "const c=OpenCC.Converter({from:'cn',to:'tw'});"
        "const s=JSON.parse(require('fs').readFileSync(0,'utf8'));"
        "process.stdout.write(JSON.stringify(s.map(c)));"
    )
    out = subprocess.run(
        ['node', '-e', script],
        input=json.dumps(strings, ensure_ascii=False),
        capture_output=True, text=True, cwd=str(OCC.parent), check=True,
    )
    return json.loads(out.stdout)


def collect(node, path=()):
    """Yield the path of every convertible leaf string."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k in SKIP_KEYS:
                continue
            if isinstance(v, str):
                yield path + (k,)
            elif isinstance(v, (dict, list)):
                yield from collect(v, path + (k,))
    elif isinstance(node, list):
        for i, item in enumerate(node):
            if isinstance(item, str):
                yield path + (i,)
            elif isinstance(item, (dict, list)):
                yield from collect(item, path + (i,))


def apply(doc, paths, values):
    for p, val in zip(paths, values):
        cur = doc
        for step in p[:-1]:
            cur = cur[step]
        cur[p[-1]] = val


def main():
    if not OCC.exists():
        sys.exit("opencc-js missing — run: cd tools && npm i opencc-js")

    # ---- data/lab-zh-tw.json -------------------------------------------------
    src = json.loads((ROOT / 'data/lab.json').read_text())
    paths = list(collect(src))
    raw = []
    for p in paths:
        cur = src
        for step in p:
            cur = cur[step]
        raw.append(cur)

    converted = converter(raw)
    for a, b in TERMS:
        converted = [s.replace(a, b) for s in converted]

    dst = json.loads(json.dumps(src))
    apply(dst, paths, converted)
    (ROOT / 'data/lab-zh-tw.json').write_text(
        json.dumps(dst, indent=2, ensure_ascii=False) + '\n')
    print(f'data/lab-zh-tw.json — {len(paths)} strings')

    # ---- i18n/zh-tw.yaml -----------------------------------------------------
    i18n_src = (ROOT / 'i18n/zh-cn.yaml').read_text()
    quoted_m = list(re.finditer(r'"((?:[^"\\]|\\.)*)"', i18n_src))
    block_m = list(re.finditer(r'(^[a-zA-Z0-9_]+:\s*\|\n)((?:(?:    .*|[ \t]*)\n)+?)(?=^[a-zA-Z0-9_]+:|\Z)', i18n_src, re.M))
    all_raw = [m.group(1) for m in quoted_m] + [m.group(2) for m in block_m]
    conv = converter(all_raw)
    for a, b in TERMS:
        conv = [s.replace(a, b) for s in conv]
    conv_q = conv[:len(quoted_m)]
    conv_b = conv[len(quoted_m):]
    it_q = iter(conv_q)
    out = re.sub(r'"((?:[^"\\]|\\.)*)"', lambda m: '"' + next(it_q) + '"', i18n_src)
    it_b = iter(conv_b)
    out = re.sub(r'(^[a-zA-Z0-9_]+:\s*\|\n)((?:(?:    .*|[ \t]*)\n)+?)(?=^[a-zA-Z0-9_]+:|\Z)', lambda m: m.group(1) + next(it_b), out, flags=re.M)
    (ROOT / 'i18n/zh-tw.yaml').write_text(out)
    print(f'i18n/zh-tw.yaml — {len(all_raw)} strings ({len(quoted_m)} quoted, {len(block_m)} blocks)')

    # ---- content/**/index.zh-tw.md ------------------------------------------
    files = sorted((ROOT / 'content').rglob('index.zh-cn.md'))
    files.append(ROOT / 'content/_index.zh-cn.md')
    for f in files:
        text = f.read_text()
        m = re.match(r'^---\n([\s\S]*?)\n---\n([\s\S]*)$', text)
        front, body = (m.group(1), m.group(2)) if m else ('', text)
        fm = re.findall(r'^(title|description):\s*"(.*)"$', front, re.M)
        block = converter([v for _, v in fm]) if fm else []
        for a, b in TERMS:
            block = [s.replace(a, b) for s in block]
        for (key, _), new in zip(fm, block):
            front = re.sub(rf'^{key}:\s*".*"$', f'{key}: "{new}"',
                           front, count=1, flags=re.M)
        body_tw = converter([body])[0] if body.strip() else body
        for a, b in TERMS:
            body_tw = body_tw.replace(a, b)
        dst = f.with_name(f.name.replace('zh-cn', 'zh-tw'))
        dst.write_text(f'---\n{front}\n---\n{body_tw}')
    print(f'content — {len(files)} files')


if __name__ == '__main__':
    main()
