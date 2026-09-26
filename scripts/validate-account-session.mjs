#!/usr/bin/env node
/**
 * Auth step 1: account session on Profile + immediate persist on sign-out.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const profile = read('src/screens/ProfileScreen.tsx');
if (!profile.includes('AccountSessionSection')) {
  console.error('ProfileScreen must render AccountSessionSection');
  process.exit(1);
}

const appContext = read('src/context/AppContext.tsx');
if (!appContext.includes('persistSessionPatch')) {
  console.error('AppContext must define persistSessionPatch');
  process.exit(1);
}
if (!/signOut[\s\S]*persistSessionPatch[\s\S]*isAuthenticated: false/.test(appContext)) {
  console.error('signOut must persist isAuthenticated: false via persistSessionPatch');
  process.exit(1);
}
if (!/restartCloudSignIn[\s\S]*persistSessionPatch[\s\S]*hasOnboarded: false/.test(appContext)) {
  console.error('restartCloudSignIn must persist hasOnboarded: false via persistSessionPatch');
  process.exit(1);
}

console.log('validate-account-session: OK');
