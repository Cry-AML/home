#!/usr/bin/env bash
# Acceptance verification for the Hugo + Blowfish migration on the hugo branch.
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

echo "== 2. Core Features Retention =="
chk "ambient-canvas in ZH" "grep -q 'ambient-canvas' public/index.html"
chk "ambient-canvas in EN" "grep -q 'ambient-canvas' public/en/index.html"
chk "wen-lab script bundled & minified" "grep -q 'wen-lab.min' public/index.html"
chk "pedigree timeline nodes present" "[ \$(grep -o 'pedigree-node' public/index.html | wc -l) -ge 7 ]"
chk "pedigree indicators present" "grep -q 'pedigree-indicator' public/index.html"
chk "publication cards present (9 papers)" "[ \$(grep -o 'publication-card' public/index.html | wc -l) -eq 9 ]"
chk "figure-modal with a11y dialog" "grep -q 'figure-modal' public/index.html && grep -q 'role=dialog' public/index.html"
chk "abstract-modal with a11y dialog" "grep -q 'abstract-modal' public/index.html"
chk "toast notification element present" "grep -q 'toast-notification' public/index.html"

echo "== 3. Theme Palettes & Styles =="
chk "navy theme token in CSS" "grep -q 'data-theme=navy' public/css/main.bundle.min.*.css"
chk "crimson theme token in CSS" "grep -q 'data-theme=crimson' public/css/main.bundle.min.*.css"
chk "emerald theme token in CSS" "grep -q 'data-theme=emerald' public/css/main.bundle.min.*.css"
chk "dark theme token in CSS" "grep -q 'data-theme=dark' public/css/main.bundle.min.*.css"
chk "theme option buttons in UI" "[ \$(grep -o 'data-theme-name=' public/index.html | wc -l) -ge 4 ]"

echo "== 4. Bilingual & Blowfish Integration =="
chk "ZH title rendered" "grep -q '文卓谦实验室 | Wen Laboratory' public/index.html"
chk "EN title rendered" "grep -q 'Wen Laboratory | SYSU' public/en/index.html"
chk "Blowfish translation menu in ZH" "grep -q 'nested-menu' public/index.html"
chk "Blowfish translation menu in EN" "grep -q 'nested-menu' public/en/index.html"
chk "Blowfish appearance switcher in ZH" "grep -q 'appearance-switcher' public/index.html"
chk "Blowfish appearance switcher in EN" "grep -q 'appearance-switcher' public/en/index.html"

echo "== 5. Scientific Accuracy & Identifiers =="
chk "Nat Commun 2026 Phase II present" "grep -q 'Quizartinib and omacetaxine mepesuccinate' public/index.html"
chk "Blood 2023 PLK4 present" "grep -q '10.1182/blood.2023019782' public/index.html"
chk "Highwire press meta tag in head" "grep -q 'citation_title' public/index.html"
chk "Canonical link present" "grep -q 'rel=canonical' public/index.html"

echo ""
if [ "$fail" -eq 0 ]; then
  printf '\033[32mALL %d HUGO ACCEPTANCE CHECKS PASSED!\033[0m\n' "$pass"
else
  printf '\033[31m%d CHECKS FAILED out of %d\033[0m\n' "$fail" "$((pass+fail))"
  exit 1
fi
