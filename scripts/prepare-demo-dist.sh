#!/usr/bin/env bash
# Post-process Expo web export: cache-busting meta tags + build stamp on index.html.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/dist/index.html"

if [[ ! -f "$INDEX" ]]; then
  echo "prepare-demo-dist: missing $INDEX — run expo export first" >&2
  exit 1
fi

BUILD_ID="${EXPO_PUBLIC_BUILD_ID:-$("$ROOT/scripts/resolve-build-id.sh")}"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

export BUILD_ID STAMP INDEX
node <<'NODE'
const fs = require('fs');

const indexPath = process.env.INDEX;
const buildId = process.env.BUILD_ID;
const stamp = process.env.STAMP;

let html = fs.readFileSync(indexPath, 'utf8');

// Root demo (`serve -s dist` on :8090) must not reference GitHub Pages base path.
html = html.replace(/\/New-APP01\//g, '/');

html = html.replace(/<!-- spark-demo-build:[^>]*-->\s*/g, '');
html = html.replace(
  /<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"\s*\/?>\s*/gi,
  '',
);
html = html.replace(/<meta http-equiv="Pragma" content="no-cache"\s*\/?>\s*/gi, '');
html = html.replace(/<meta http-equiv="Expires" content="0"\s*\/?>\s*/gi, '');

const injection = [
  `<!-- spark-demo-build: ${buildId} at ${stamp} -->`,
  '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />',
  '<meta http-equiv="Pragma" content="no-cache" />',
  '<meta http-equiv="Expires" content="0" />',
].join('\n    ');

if (/<head[^>]*>/i.test(html)) {
  html = html.replace(/<head([^>]*)>/i, `<head$1>\n    ${injection}`);
} else {
  console.warn('prepare-demo-dist: no <head> found — prepending meta block');
  html = `${injection}\n${html}`;
}

const loadingShell = `
    <div id="spark-demo-boot" style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:#0d0d0f;color:#f5f5f7;z-index:99999;padding:24px;text-align:center;">
      <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.15);border-top-color:#5b9dff;border-radius:50%;animation:sparkSpin 0.9s linear infinite;margin-bottom:20px;"></div>
      <p style="margin:0 0 8px;font-size:17px;font-weight:600;">Loading Spark demo</p>
      <p style="margin:0;font-size:14px;opacity:0.72;max-width:320px;line-height:1.45;">First visit can take up to a minute while the app downloads. Build ${buildId}</p>
      <p id="spark-demo-boot-stuck" style="display:none;margin:16px 0 0;font-size:13px;opacity:0.85;max-width:340px;line-height:1.45;">Still blank? Hard refresh (Cmd+Shift+R) or open in a private window.</p>
      <style>@keyframes sparkSpin{to{transform:rotate(360deg)}}</style>
    </div>
    <script>
      (function () {
        var boot = document.getElementById('spark-demo-boot');
        var stuck = document.getElementById('spark-demo-boot-stuck');
        function hideBoot() {
          if (boot) boot.style.display = 'none';
        }
        var obs = new MutationObserver(function () {
          var root = document.getElementById('root');
          if (root && root.childElementCount > 0) {
            hideBoot();
            obs.disconnect();
          }
        });
        obs.observe(document.getElementById('root'), { childList: true, subtree: true });
        setTimeout(function () {
          var root = document.getElementById('root');
          if (!root || root.childElementCount === 0) {
            if (stuck) stuck.style.display = 'block';
          }
        }, 45000);
        setInterval(function () {
          var root = document.getElementById('root');
          if (root && root.childElementCount > 0) hideBoot();
        }, 500);
      })();
    </script>`;

if (/<div id="root"><\/div>/.test(html)) {
  html = html.replace(/<div id="root"><\/div>/, `<div id="root"></div>${loadingShell}`);
}

html = html.replace(
  /(<script src="\/_expo\/static\/js\/web\/index-[^"]+\.js")(\s*defer)?><\/script>/,
  `$1?v=${buildId}$2></script>`,
);

fs.writeFileSync(indexPath, html);
console.log(`prepare-demo-dist: patched index.html (build ${buildId})`);
NODE

cp "$INDEX" "$ROOT/dist/404.html"
echo "prepare-demo-dist: copied index.html → 404.html"
