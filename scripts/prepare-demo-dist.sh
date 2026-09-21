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

fs.writeFileSync(indexPath, html);
console.log(`prepare-demo-dist: patched index.html (build ${buildId})`);
NODE

cp "$INDEX" "$ROOT/dist/404.html"
echo "prepare-demo-dist: copied index.html → 404.html"
