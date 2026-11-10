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
chk "fixed header at top" "grep -q 'fixed top-0 inset-x-0' public/index.html"
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

echo "== 5. Radix UI Colors & 0.5px Concentric Borders =="
chk "Radix Slate scale in CSS" "grep -q 'slate-12' public/css/main.bundle.min.*.css"
chk "Radix Indigo scale in CSS" "grep -q 'indigo-9' public/css/main.bundle.min.*.css"
chk "0.5px border styling defined" "grep -qE '0?\.5px' public/css/main.bundle.min.*.css"
chk "ui-card defined with concentric 0.5px border" "grep -q 'ui-card' public/css/main.bundle.min.*.css"
chk "ui-card-inner concentric nested class present" "grep -q 'ui-card-inner' public/index.html"
chk "no colored border-left on cards" "! grep -q 'border-l-4' public/index.html"
chk "250ms ease-out transitions defined" "grep -q '250ms ease-out' public/css/main.bundle.min.*.css"

echo "== 6. Restrained Typography Scales (Min 12px) =="
chk "ui-title class present" "grep -q 'ui-title' public/index.html"
chk "ui-heading class present" "grep -q 'ui-heading' public/index.html"
chk "ui-body class present" "grep -q 'ui-body' public/index.html"
chk "ui-caption class present" "grep -q 'ui-caption' public/index.html"
chk "no text-[11px] or text-[10px]" "! grep -qE 'text-\[1[01]px\]' public/index.html"

echo "== 7. Scientific Core & Accuracy =="
chk "Nat Commun 2026 in publications page" "grep -q 'Quizartinib and omacetaxine mepesuccinate' public/publications/index.html"
chk "Blood 2023 PLK4 in publications page" "grep -q '10.1182/blood.2023019782' public/publications/index.html"
chk "All 9 publication cards on publications page" "[ \$(grep -o 'publication-card' public/publications/index.html | wc -l) -eq 9 ]"
chk "Highwire press meta tag in head" "grep -q 'citation_title' public/index.html"
chk "Canonical link present" "grep -q 'canonical' public/index.html"

echo ""
if [ "$fail" -eq 0 ]; then
  printf '\033[32mALL %d ACCEPTANCE CHECKS PASSED!\033[0m\n' "$pass"
else
  printf '\033[31m%d CHECKS FAILED out of %d\033[0m\n' "$fail" "$((pass+fail))"
  exit 1
fi
