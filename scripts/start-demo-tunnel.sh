#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Building web demo (root-hosted for tunnels)..."
npm run build:web
cp dist/index.html dist/404.html

echo "Starting static server on :8090..."
npx --yes serve dist -s -l 8090 &
SERVE_PID=$!

cleanup() {
  kill "$SERVE_PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 2

if command -v cloudflared >/dev/null 2>&1; then
  echo "Starting Cloudflare tunnel..."
  echo "NOTE: Use build:web (root paths). Do NOT serve a build:web:pages artifact on tunnels."
  cloudflared tunnel --url http://localhost:8090
elif [ -x /tmp/cloudflared ]; then
  echo "Starting Cloudflare tunnel (downloaded binary)..."
  /tmp/cloudflared tunnel --url http://localhost:8090
else
  echo "cloudflared not found — demo at http://localhost:8090"
  wait "$SERVE_PID"
fi
