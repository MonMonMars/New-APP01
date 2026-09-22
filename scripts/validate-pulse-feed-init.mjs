#!/usr/bin/env node
/** Ensures Pulse static feed modules finish init (no infinite interleave loop). */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const child = spawn('npx', ['--yes', 'tsx', path.join(root, 'validate-pulse-feed-init.ts')], {
  cwd: path.join(root, '..'),
  stdio: 'inherit',
});

const timer = setTimeout(() => {
  child.kill('SIGKILL');
  console.error('validate-pulse-feed-init: timed out (likely infinite loop)');
  process.exit(1);
}, 8000);

child.on('exit', (code, signal) => {
  clearTimeout(timer);
  if (signal === 'SIGKILL') {
    process.exit(1);
  }
  process.exit(code === 0 ? 0 : 1);
});
