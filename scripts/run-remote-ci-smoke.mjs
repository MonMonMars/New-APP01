#!/usr/bin/env node
/**
 * Run the same Playwright scripts as GitHub CI against a deployed demo URL.
 * Usage: DEMO_URL=https://your-app.vercel.app node scripts/run-remote-ci-smoke.mjs
 */
import { spawnSync } from 'node:child_process';

const url = process.env.DEMO_URL ?? process.argv[2];
if (!url) {
  console.error('Usage: DEMO_URL=https://… node scripts/run-remote-ci-smoke.mjs');
  console.error('   or: node scripts/run-remote-ci-smoke.mjs https://…');
  process.exit(1);
}

const steps = [
  'scripts/verify-demo-link.mjs',
  'scripts/check-pulse-link-routing.mjs',
  'scripts/check-mini-window.mjs',
  'scripts/check-privacy-version-footer.mjs',
  'scripts/check-map-world-search.mjs',
];

for (const script of steps) {
  const result = spawnSync(process.execPath, [script, url], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('remote-ci-smoke: ok');
