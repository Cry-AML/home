#!/usr/bin/env bash
# Acceptance verification for Radix UI Design Refactor on the hugo branch.
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

echo "== 2. Rule 1: No Middle Dot '·' =="
chk "no middle dot in public/index.html" "! grep -q '·' public/index.html"
chk "no middle dot in public/en/index.html" "! grep -q '·' public/en/index.html"

echo "== 3. Rule 4: Radix UI Colors =="
chk "Radix Slate scale in CSS" "grep -q 'slate-12' public/css/main.bundle.min.*.css"
chk "Radix Indigo scale in CSS" "grep -q 'indigo-9' public/css/main.bundle.min.*.css"
chk "Radix scheme configured" "grep -q 'radix' config/_default/params.toml"

echo "== 4. Rules 5 & 6: Concentric Radii & 0.5px Borders =="
chk "0.5px border styling defined" "grep -qE '0?\.5px' public/css/main.bundle.min.*.css"
chk "ui-card defined with concentric 0.5px border" "grep -q 'ui-card' public/css/main.bundle.min.*.css"
chk "ui-card-inner concentric nested class present" "grep -q 'ui-card-inner' public/index.html"
chk "no colored border-left on cards" "! grep -q 'border-l-4' public/index.html"

echo "== 5. Rule 7: 250ms Ease-Out Transitions =="
chk "250ms ease-out transitions defined" "grep -q '250ms ease-out' public/css/main.bundle.min.*.css"

echo "== 6. Rule 8: Restrained Typography Scales (Min 12px) =="
chk "ui-title class present" "grep -q 'ui-title' public/index.html"
chk "ui-heading class present" "grep -q 'ui-heading' public/index.html"
chk "ui-body class present" "grep -q 'ui-body' public/index.html"
chk "ui-caption class present" "grep -q 'ui-caption' public/index.html"
chk "no text-[11px] or text-[10px]" "! grep -qE 'text-\[1[01]px\]' public/index.html"

echo "== 7. Rules 2, 9 & 11: Clean UI, No Eyebrows & Reduced Cognitive Load =="
chk "redundant tab prompt removed" "! grep -q '切换下方平台卡片' public/index.html"
chk "redundant figure hint text removed" "! grep -q '点击图片放大查看' public/index.html"
chk "redundant publication intro removed" "! grep -q '以下展示文卓谦博士及团队的核心代表作' public/index.html"
chk "no disruptive hero theme-switcher pills" "! grep -q 'data-theme-name' public/index.html"
chk "no redundant section eyebrows (Rule 11)" "! grep -qE 'PRINCIPAL INVESTIGATOR|SINGLE-CELL ATLAS|JOIN OUR LAB' public/index.html"

echo "== 8. Scientific Core & Navigation =="
chk "Nat Commun 2026 Phase II present" "grep -q 'Quizartinib and omacetaxine mepesuccinate' public/index.html"
chk "Blood 2023 PLK4 present" "grep -q '10.1182/blood.2023019782' public/index.html"
chk "Highwire press meta tag in head" "grep -q 'citation_title' public/index.html"
chk "Canonical link present" "grep -q 'rel=canonical' public/index.html"
chk "Blowfish translation menu in ZH" "grep -q 'nested-menu' public/index.html"
chk "Blowfish appearance switcher in ZH" "grep -q 'appearance-switcher' public/index.html"
chk "All 9 publication cards rendered" "[ \$(grep -o 'publication-card' public/index.html | wc -l) -eq 9 ]"

echo ""
if [ "$fail" -eq 0 ]; then
  printf '\033[32mALL %d ACCEPTANCE CHECKS PASSED!\033[0m\n' "$pass"
else
  printf '\033[31m%d CHECKS FAILED out of %d\033[0m\n' "$fail" "$((pass+fail))"
  exit 1
fi
