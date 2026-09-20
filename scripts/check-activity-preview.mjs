#!/usr/bin/env node
/**
 * Verify activity alerts open PersonPreviewSheet with photos + Spark bar.
 * Usage: node scripts/check-activity-preview.mjs <url>
 */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/check-activity-preview.mjs <url>');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

// Open Activity tab
const activityTab = page.getByText('Activity', { exact: true }).last();
await activityTab.click();
await page.waitForTimeout(800);

// Tap first person alert (Alex Chen)
const alertRow = page.getByText(/alex chen upvoted/i).first();
await alertRow.click();
await page.waitForTimeout(900);

const body = await page.locator('body').innerText();
const hasAlex = /alex chen/i.test(body);
const hasPhotos = /photo \d+ of \d+/i.test(body);
const hasSparkBar = /actions sync to|saved to likes|mi away|\d+ mi away/i.test(body);
const hasSocialQuote = /hot take: the best productivity hack/i.test(body);

console.log(
  JSON.stringify(
    {
      hasAlex,
      hasPhotos,
      hasSparkBar,
      hasSocialQuote,
      sample: body.slice(0, 700),
    },
    null,
    2,
  ),
);

await browser.close();
process.exit(hasAlex && hasPhotos && hasSparkBar && hasSocialQuote ? 0 : 1);
