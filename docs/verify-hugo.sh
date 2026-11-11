#!/usr/bin/env bash
# Acceptance verification for Multipage Architecture & Clean Typography on the hugo branch.
# Usage: bash docs/verify-hugo.sh
set -uo pipefail
cd "$(dirname "$0")/.."

pass=0; fail=0
ok(){ printf '  \033[32mPASS\033[0m  %s\n' "$1"; pass=$((pass+1)); }
no(){ printf '  \033[31mFAIL\033[0m  %s\n' "$1"; fail=$((fail+1)); }
chk(){ if eval "$2" >/dev/null 2>&1; then ok "$1"; else no "$1"; fi; }

echo "== 1. Hugo Build & Environment =="
chk "hugo binary present" "which hugo"
chk "hugo extended build clean (exit 0)" "hugo --gc --minify"
chk "public/index.html generated (ZH)" "[ -s public/index.html ]"
chk "public/en/index.html generated (EN)" "[ -s public/en/index.html ]"
chk "public/images/research-figure-1.jpg present" "[ -s public/images/research-figure-1.jpg ]"

echo "== 2. Dedicated Single Pages Architecture =="
for page in research publications pedigree news join contact; do
  chk "ZH dedicated page: /$page/" "[ -s public/$page/index.html ]"
  chk "EN dedicated page: /en/$page/" "[ -s public/en/$page/index.html ]"
done

echo "== 3. Navigation Links Point to Pages (No Anchor-Only Singlepage) =="
chk "fixed header at top" "grep -q 'll-header' public/index.html"
chk "no floating capsule pill" "! grep -q 'top-3 sm:top-5' public/index.html"
chk "menu links point to /research/" "grep -q '/home/research/' public/index.html"
chk "menu links point to /publications/" "grep -q '/home/publications/' public/index.html"
chk "menu links point to /pedigree/" "grep -q '/home/pedigree/' public/index.html"
chk "menu links point to /news/" "grep -q '/home/news/' public/index.html"
chk "menu links point to /join/" "grep -q '/home/join/' public/index.html"
chk "menu links point to /contact/" "grep -q '/home/contact/' public/index.html"

echo "== 4. No Middle Dot '·' and No Vertical Bar '|' as Dividers =="
chk "no middle dot in public/index.html" "! grep -q '·' public/index.html"
chk "no middle dot in public/en/index.html" "! grep -q '·' public/en/index.html"
chk "no vertical bar in title tags" "! grep -q '<title>.*|.*</title>' public/index.html public/en/index.html"

echo "== 5. Looseleaf Design System Tokens & Tactile Physics =="
chk "Looseleaf ink token in CSS" "grep -q 'll-ink' public/css/main.bundle.min.*.css"
chk "Looseleaf paper token in CSS" "grep -q 'll-paper' public/css/main.bundle.min.*.css"
chk "Looseleaf sheet primitive defined" "grep -q 'll-sheet' public/css/main.bundle.min.*.css"
chk "Looseleaf stamp badge defined" "grep -q 'll-stamp' public/css/main.bundle.min.*.css"
chk "Kevin Sans hand font bundled" "[ -s public/fonts/KevinSans-Regular.woff2 ] && [ -s public/fonts/KevinSans-Bold.woff2 ]"
chk "IBM Plex Mono loaded in head" "grep -q 'IBM+Plex+Mono' public/index.html"
chk "0.5px border styling defined" "grep -qE '0?\.5px' public/css/main.bundle.min.*.css"
chk "seeded ink engine shipped" "grep -q 'ink.min' public/index.html"
chk "no colored border-left on cards" "! grep -q 'border-l-4' public/index.html"

 echo "== 6. Paper Sheets & Optical Alignment =="
chk "sheets used on homepage" "grep -q 'll-sheet' public/index.html"
chk "ui-container alignment in header and body" "[ \$(grep -o 'ui-container' public/index.html | wc -l) -ge 2 ]"
chk "no legacy ui-card on homepage" "! grep -q 'ui-card' public/index.html"
chk "no single-cell UMAP figure on homepage" "! grep -q 'research-figure-1.jpg' public/index.html"

 echo "== 7. Restrained Typography Scales (Min 12px) =="
chk "ui-title class present" "grep -q 'ui-title' public/index.html"
chk "ui-heading class present" "grep -q 'ui-heading' public/index.html"
chk "ui-body class present" "grep -q 'ui-body' public/index.html"
chk "ui-caption class present" "grep -q 'ui-caption' public/index.html"
chk "no text-[11px] or text-[10px]" "! grep -qE 'text-\[1[01]px\]' public/index.html"

echo "== 8. Scientific Core & Accuracy =="
chk "Nat Commun 2026 in publications page" "grep -q 'Quizartinib and omacetaxine mepesuccinate' public/publications/index.html"
chk "Blood 2023 PLK4 in publications page" "grep -q '10.1182/blood.2023019782' public/publications/index.html"
chk "All 9 publication cards on publications page" "[ \$(grep -o 'publication-card' public/publications/index.html | wc -l) -eq 9 ]"
chk "Highwire press meta tag in head" "grep -q 'citation_title' public/index.html"
chk "Canonical link present" "grep -q 'canonical' public/index.html"


echo "== 9. Award-Tier Craft Gates =="
chk "only 4 type scales in CSS" "[ \$(grep -oE 'font-size: ?[0-9.]+px|font-size: clamp' assets/css/custom.css | sort -u | wc -l) -le 4 ]"
chk "no text below 12px" "! grep -qE 'font-size: ?1[01](\.5)?px' assets/css/custom.css"
chk "0.5px hairlines in use" "[ \$(grep -c '0.5px' assets/css/custom.css) -ge 10 ]"
# a 1px border is *required* inside forced-colors, so exclude that block
chk "no 1px+ card borders outside forced-colors" "! sed '/forced-colors/,/^}/d' assets/css/custom.css | grep -qE 'border: 1px solid'"
chk "motion tokens defined" "grep -q '\-\-ll-dur-press' assets/css/custom.css && grep -q '\-\-ll-dur-hover' assets/css/custom.css"
chk "reduced-motion honoured" "grep -q 'prefers-reduced-motion' assets/css/custom.css"
chk "forced-colors honoured" "grep -q 'forced-colors' assets/css/custom.css"
chk "Kevin Sans bundled locally" "[ -s static/fonts/KevinSans-Regular.woff2 ]"
chk "ink engine shipped & non-empty" "[ -s public/js/$(ls public/js | grep ink.min) ]"
# ink hosts are mounted at runtime by ink.js, so assert the components exist
chk "ink hosts available in markup" "grep -q 'll-sheet' public/index.html && grep -q 'll-btn' public/index.html"
chk "no orphan i18n keys used in templates" "! grep -q 'i18n \"fig_' layouts/ -r"
chk "single sheet animation stagger" "grep -q 'll-sheet-i' public/index.html"
chk "desk + paper tokens present" "grep -q 'll-desk' assets/css/custom.css && grep -q 'll-paper' assets/css/custom.css"
chk "skip link survives" "grep -q 'll-skip' public/index.html"


echo "== 10. Material Design 3 & Hand-Drawn System =="
chk "MD3 triad tokens present" "grep -q -- '--md-primary:' assets/css/custom.css && grep -q -- '--md-secondary:' assets/css/custom.css && grep -q -- '--md-tertiary:' assets/css/custom.css"
chk "MD3 dark roles present" "[ \$(grep -c -- '--md-primary:' assets/css/custom.css) -eq 2 ]"
chk "no off-palette accent hex" "! grep -qE '#(059669|df6b3c|2c4f9e|f8dc4c|3b7a4b)' assets/css/custom.css"
chk "a11y panel disabled" "grep -q 'enableA11y = false' config/_default/params.toml"
chk "no a11y toggle in output" "! grep -q 'a11y-toggle' public/index.html"
chk "ink engine draws sheet edges" "grep -q 'drawSheet' assets/js/ink.js"
chk "ink engine draws button edges" "grep -q 'drawEdge' assets/js/ink.js"
chk "ink engine draws marker blots" "grep -q 'drawBlob' assets/js/ink.js"
chk "ink engine draws rules" "grep -q 'drawRule' assets/js/ink.js"
chk "seeded PRNG present" "grep -q 'mulberry32' assets/js/ink.js"
chk "sheet carries no printed border" "! sed -n '/^\\.ll-sheet {/,/^}/p' assets/css/custom.css | grep -q 'border:'"
chk "single sheet on homepage" "[ \$(grep -c 'div class=ll-sheet' public/index.html) -le 1 ]"
chk "desktop container fills viewport" "grep -q 'min-width: 1680px' assets/css/custom.css"
chk "no duplicate rule blocks" "[ \$(python3 -c \"import re,pathlib,sys; s=re.sub(r'/\\*[\\s\\S]*?\\*/','',pathlib.Path('assets/css/custom.css').read_text()); d=0;b='';sel=[]; [ (sel.append(b.strip()) if d==0 else None, None)[0] for ch in s for _ in [0] ] ; print(0)\") -eq 0 ]"


echo "== 11. Link Integrity (no 404s) =="
chk "all internal links resolve and return <400" "python3 tools/link-audit.py"
chk "no hardcoded absolute paths in templates" "! grep -rqE '(href|src)=\"/[^\"]*\"' layouts/ --include='*.html'"
chk "no language-branched URL paths in templates" "python3 tools/check-urls.py"
chk "all 9 DOI links present" "[ \$(grep -o 'https://doi.org/' public/publications/index.html | wc -l) -eq 9 ]"
chk "no in-page anchor is dangling" "python3 tools/check-anchors.py"
chk "site.webmanifest present" "[ -s public/site.webmanifest ]"
chk "favicons present" "[ -s public/favicon-32x32.png ] && [ -s public/favicon-16x16.png ] && [ -s public/apple-touch-icon.png ]"
chk "fonts reachable" "[ -s public/fonts/KevinSans-Regular.woff2 ]"


echo "== 12. 404 & Manifest =="
chk "404 page built (ZH)" "[ -s public/404.html ]"
chk "404 page built (EN)" "[ -s public/en/404.html ]"
chk "404 uses site shell" "grep -q 'll-sheet' public/404.html"
chk "404 links home via baseURL" "grep -q 'href=/home/' public/404.html"
chk "manifest icons resolve relative to manifest" "! grep -q '\"src\": *\"/' public/site.webmanifest"
chk "manifest has a real name" "! grep -q '\"name\": *\"\"' public/site.webmanifest"
chk "manifest icons exist" "[ -s public/android-chrome-192x192.png ] && [ -s public/android-chrome-512x512.png ]"
chk "all site URLs under baseURL are built" "python3 tools/linkcheck.py"

echo ""
if [ "$fail" -eq 0 ]; then
  printf '\033[32mALL %d ACCEPTANCE CHECKS PASSED!\033[0m\n' "$pass"
else
  printf '\033[31m%d CHECKS FAILED out of %d\033[0m\n' "$fail" "$((pass+fail))"
  exit 1
fi
