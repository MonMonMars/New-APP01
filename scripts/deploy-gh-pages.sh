#!/usr/bin/env bash
# Build and push the web demo to the gh-pages branch (permanent GitHub Pages host).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Building for GitHub Pages (/New-APP01 base path)..."
npm run build:web:pages
cp dist/index.html dist/404.html
touch dist/.nojekyll

WORKTREE="/tmp/spark-gh-pages-deploy"
rm -rf "$WORKTREE"
git fetch origin gh-pages
git worktree add "$WORKTREE" origin/gh-pages

find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -r dist/. "$WORKTREE"/

cd "$WORKTREE"
git add -A
if git diff --staged --quiet; then
  echo "No changes to deploy."
  exit 0
fi

git commit -m "deploy: web demo $(date -u +%Y-%m-%dT%H:%MZ)"
git push origin HEAD:gh-pages

cd "$ROOT"
git worktree remove "$WORKTREE" --force

echo ""
echo "Deployed to gh-pages branch."
echo "Permanent URL (after Pages is enabled): https://monmonmars.github.io/New-APP01/"
echo "Enable at: https://github.com/MonMonMars/New-APP01/settings/pages"
echo "  Source: Deploy from branch → gh-pages → / (root)"
echo ""
echo "Private repos need GitHub Pro for Pages, OR make the repo public."
echo "Alternative: import repo at https://vercel.com (works with private repos)."
