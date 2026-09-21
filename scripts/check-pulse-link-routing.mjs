#!/usr/bin/env node
/**
 * Pulse taps: headlines/activity rows open articles or activity sheets — not dating mini-windows.
 * Avatars with "View photos from" still open mini-windows.
 */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:8090';

async function hasMiniWindow(page) {
  const text = await page.locator('body').innerText();
  if (/photo \d+ of \d+/i.test(text)) {
    return true;
  }
  return page
    .getByLabel(/like profile|unlike profile|pass profile|super like profile/i)
    .first()
    .isVisible()
    .catch(() => false);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(12000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

let avatarOk = false;
for (let scroll = 0; scroll < 8 && !avatarOk; scroll += 1) {
  const reporter = page.getByLabel(/^View photos from /i).first();
  if (await reporter.isVisible().catch(() => false)) {
    await reporter.click({ force: true });
    await page.waitForTimeout(700);
    avatarOk = await hasMiniWindow(page);
    if (avatarOk) {
      await page.getByLabel('Close').last().click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
  }
  await page.evaluate(() => window.scrollBy(0, 480));
  await page.waitForTimeout(350);
}

const article = page.getByLabel(/Read article:/).first();
await article.click({ force: true });
await page.waitForTimeout(700);
const articleOk =
  (await page.getByLabel(/Read on /).first().isVisible().catch(() => false)) &&
  !(await hasMiniWindow(page));
await page.getByLabel('Close').last().click({ force: true }).catch(() => {});
await page.waitForTimeout(400);

const disguisedHeadline = page.getByLabel(/Read article:/).nth(1);
if (await disguisedHeadline.isVisible().catch(() => false)) {
  await disguisedHeadline.click({ force: true });
  await page.waitForTimeout(700);
}
const disguisedOk = !(await hasMiniWindow(page));
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(300);

const activityTab = page.getByRole('tab', { name: /activity/i }).first();
await activityTab.click({ force: true });
await page.waitForTimeout(700);
const alertRow = page.getByText(/upvoted|commented|liked your/i).first();
await alertRow.click({ force: true });
await page.waitForTimeout(700);
const activityOk =
  (await page.locator('body').innerText()).match(/upvoted|activity|notification/i) &&
  !(await hasMiniWindow(page));

console.log(
  JSON.stringify({ articleOk, disguisedOk, avatarOk, activityOk }, null, 2),
);

await browser.close();
const ok = articleOk && disguisedOk && activityOk && avatarOk;
process.exit(ok ? 0 : 1);
