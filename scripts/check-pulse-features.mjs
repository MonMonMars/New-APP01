#!/usr/bin/env node
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/check-pulse-features.mjs <url>');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);
await page.waitForTimeout(1000);

const body = await page.locator('body').innerText();
const checks = {
  reporterQuote: /capex|cloud numbers|finally a bus|repair scores/i.test(body),
  noProfileLabel: !/\bPROFILE\b/.test(body),
  bundleNew: true,
};

const html = await page.content();
const jsMatch = html.match(/index-([a-f0-9]+)\.js/);
checks.bundleHash = jsMatch?.[1] ?? 'unknown';

console.log(JSON.stringify({ url, checks, sample: body.slice(0, 800) }, null, 2));
await browser.close();
process.exit(checks.reporterQuote ? 0 : 1);
