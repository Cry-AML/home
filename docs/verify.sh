#!/usr/bin/env bash
# Acceptance verification for the award-tier fix pass.
# Usage: bash docs/verify.sh
set -uo pipefail
cd "$(dirname "$0")/.."

pass=0; fail=0
ok(){ printf '  \033[32mPASS\033[0m  %s\n' "$1"; pass=$((pass+1)); }
no(){ printf '  \033[31mFAIL\033[0m  %s\n' "$1"; fail=$((fail+1)); }
chk(){ if eval "$2" >/dev/null 2>&1; then ok "$1"; else no "$1"; fi; }

echo "== A. Correctness =="
chk "theme-surface defined"      "grep -qE '^\s*\.theme-surface\s*\{' assets/css/styles.css"
chk "theme-transition defined"   "grep -qE '^\s*\.theme-transition\s*\{' assets/css/styles.css"
chk "hero-gradient-overlay defined" "grep -qE '^\s*\.hero-gradient-overlay\s*\{' assets/css/styles.css"
chk "text-on-primary token present in all 4 themes" "[ \$(grep -c -- '--text-on-primary' assets/css/styles.css) -ge 4 ]"
chk "dark token is dark ink (#04121f)" "grep -A40 'data-theme=\"dark\"' assets/css/styles.css | grep -q 'text-on-primary: *#04121f'"
chk "no text-white left on var(--primary) CTA" "! grep -q 'text-white[^\"]*\" *style=\"background-color: var(--primary)' index.html"
chk "active pill uses --text-on-primary" "grep -q 'color: var(--text-on-primary) !important' assets/css/styles.css"
chk "tailwind darkMode:class set" "grep -q \"darkMode: *'class'\" index.html"
chk "dark class synced in setTheme" "grep -q \"classList.toggle('dark'\" assets/js/main.js"
chk "inline theme bootstrap before stylesheet" "awk '/wen_lab_theme/{f=1} /styles.css/{if(f)print \"ok\"}' index.html | grep -q ok"
chk "blood2023 doi corrected" "grep -q '10.1182/blood.2023019782' assets/js/data.js"
chk "old 404 doi gone" "! grep -q '10.1182/blood.2023020021' assets/js/data.js"
for pm in 37738460 38228958 35624145 34610101 25940713 25820334 24608976 22368270; do
  chk "PMID $pm present" "grep -q '$pm' assets/js/data.js"
done
chk "Haematologica 100(7):e250-e253" "grep -q '100(7):e250-e253' assets/js/data.js"

echo "== B. Accessibility / performance =="
chk "theme menu no longer hover-only" "! grep -q 'group-hover:block' index.html"
chk "theme toggle has aria-expanded" "grep -q 'aria-expanded' index.html"
chk "skip link present" "grep -q 'Skip to content' index.html"
chk "<main id=\"main\"> present" "grep -q '<main id=\"main\"' index.html"
chk "role=dialog present (2x)" "[ \$(grep -c 'role=\"dialog\"' index.html) -ge 2 ]"
chk "aria-modal present" "grep -q 'aria-modal=\"true\"' index.html"
chk "close buttons have aria-label" "[ \$(grep -c 'aria-label=\"Close\"' index.html) -ge 2 ]"
chk "focus-visible ring defined" "grep -q ':focus-visible' assets/css/styles.css"
chk "film-grain below modals" "! grep -q 'z-index: 999' assets/css/styles.css"
chk "modals at z-[60]" "[ \$(grep -c 'z-\[60\]' index.html) -ge 2 ]"
chk "reduced-motion honoured in JS" "grep -q 'prefers-reduced-motion' assets/js/main.js"
chk "devicePixelRatio used" "grep -q 'devicePixelRatio' assets/js/main.js"
chk "visibilitychange pause" "grep -q 'visibilitychange' assets/js/main.js"
chk "canvas IntersectionObserver" "grep -q 'IntersectionObserver' assets/js/main.js"
chk "author regex guarded (Leung AYH safe)" "grep -q 'Leung AY(?!\[A-Za-z\])' assets/js/main.js"
chk "Escape closes modals" "grep -q \"e.key === 'Escape'\" assets/js/main.js"
chk "mobile drawer auto-closes" "grep -q 'mobile-nav-drawer' assets/js/main.js && grep -q 'add(.hidden.)' assets/js/main.js"
chk "highwire citation meta" "grep -q 'citation_title' index.html"
chk "canonical link" "grep -q 'rel=\"canonical\"' index.html"
chk "figure modal localized" "grep -q 'fig_panel_a' assets/js/i18n.js"

echo "== C. Craft =="
chk "italic removed from CN hero" "! grep -q 'font-editorial italic' index.html"
chk "editorial font-style normal" "grep -q 'font-style: normal' assets/css/styles.css"
chk "py-24 replaced with fluid rhythm" "! grep -q 'class=\"py-24' index.html"
chk "stat: 10+ claim removed" "! grep -q '10+ 篇' index.html"
chk "progress bar transition removed" "! grep -q 'transition: width .1s ease-out' assets/css/styles.css"
chk "fonts not via @import" "! grep -q '@import url' assets/css/styles.css"
chk "fonts via preconnect link" "grep -q 'rel=\"preconnect\"' index.html"
chk "CJK serif fallback" "grep -q 'Songti SC' assets/css/styles.css"
chk "scroll reveal CSS" "grep -q 'is-revealed' assets/css/styles.css"
chk "scroll reveal JS" "grep -q 'is-revealed' assets/js/main.js"
chk "prose bumped to 15px" "grep -q 'text-\[15px\]' index.html"

chk "pi_title localized (zh+en)" "grep -q 'pi_title: \"副教授' assets/js/i18n.js && grep -q 'pi_title: \"Associate Professor' assets/js/i18n.js"
chk "no data-i18n key missing from dictionary" "node -e \"
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const keys=new Set([...html.matchAll(/data-i18n(?:-placeholder)?=\\\"([^\\\"]+)/g)].map(m=>m[1]));
let src=fs.readFileSync('assets/js/i18n.js','utf8').replace(/^const I18N_DICTIONARY =/m,'globalThis.D=');
eval(src);
const D=globalThis.D;
const miss=[...keys].filter(k=>!(k in D.zh)||!(k in D.en));
if(miss.length){console.error('missing:',miss);process.exit(1);}
\""
chk "marquee stops under reduced-motion" "awk '/prefers-reduced-motion/,/^}/' assets/css/styles.css | grep -q 'marquee-track'"
chk "no bg-white in JS templates" "! grep -q 'bg-white' assets/js/main.js"

echo "== D. Syntax =="
for f in assets/js/data.js assets/js/i18n.js assets/js/main.js; do
  chk "node -c $f" "node -c $f"
done

echo "== E. Serves =="
python3 -m http.server 8123 >/dev/null 2>&1 &
SRV=$!; sleep 1
for f in index.html assets/css/styles.css assets/js/data.js assets/js/i18n.js assets/js/main.js assets/images/research-figure-1.jpg; do
  chk "HTTP 200 $f" "[ \"\$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8123/$f)\" = 200 ]"
done
kill $SRV 2>/dev/null

echo
printf "RESULT: %d passed, %d failed\n" "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
