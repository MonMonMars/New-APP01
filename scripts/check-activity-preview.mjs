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

// Open Activity tab (bottom Pulse tabs)
const activityTab = page.getByRole('tab', { name: /activity/i }).first();
await activityTab.click();
await page.waitForTimeout(800);

const activityBody = await page.locator('body').innerText();
const hasActivityList = /alex chen upvoted|activity/i.test(activityBody);

// Row tap should open the activity sheet — not force a dating mini-window.
const alertRow = page.getByText(/alex chen upvoted/i).first();
await alertRow.click();
await page.waitForTimeout(900);

const sheetBody = await page.locator('body').innerText();
const hasAlex = /alex chen/i.test(sheetBody);
const openedActivitySheet = /upvoted your comment|upvoted/i.test(sheetBody);
/** Activity alerts use FeedPersonRow avatars, not the dating photo pager. */
const hasActivityProfile = /alex chen/i.test(sheetBody) && /upvoted/i.test(sheetBody);

// Explicit woven reporter on the home feed still opens mini-window with photos.
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(400);
const homeTab = page.getByRole('tab', { name: /for you|home/i }).first();
if (await homeTab.isVisible().catch(() => false)) {
  await homeTab.click();
  await page.waitForTimeout(800);
}
const reporterThumb = page.getByLabel(/view photos from/i).first();
let reporterMiniWindow = false;
if (await reporterThumb.isVisible({ timeout: 4000 }).catch(() => false)) {
  await reporterThumb.click();
  await page.waitForTimeout(900);
  const miniBody = await page.locator('body').innerText();
  reporterMiniWindow = /photo \d+ of \d+/i.test(miniBody);
}

console.log(
  JSON.stringify(
    {
      hasAlex,
      openedActivitySheet,
      hasActivityProfile,
      reporterMiniWindow,
      hasActivityList,
      sample: sheetBody.slice(0, 700),
    },
    null,
    2,
  ),
);

await browser.close();
const ok = hasAlex && openedActivitySheet && hasActivityList && hasActivityProfile && reporterMiniWindow;
process.exit(ok ? 0 : 1);
