#!/usr/bin/env node
/**
 * Verify activity alerts open PersonPreviewSheet with photos + Spark bar.
 * Usage: node scripts/check-activity-preview.mjs <url>
 */
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/check-activity-preview.mjs <url>');
  process.exit(1);
}

async function dismissCookies(page) {
  const btn = page.getByText(/essential only/i).first();
  if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(400);
  }
}

async function completeOnboarding(page) {
  await page.getByText(/continue without account/i).click();
  for (let step = 0; step < 15; step++) {
    const text = await page.locator('body').innerText();
    if (/community guidelines/i.test(text)) {
      await page.getByText(/i have read and agree/i).first().click();
      await page.getByText(/continue.*18/i).first().click();
      continue;
    }
    if (/choose your region/i.test(text)) {
      await page.getByText(/use my location/i).first().click();
      continue;
    }
    if (/create your profile/i.test(text) && (await page.getByText(/open pulse/i).first().isVisible().catch(() => false))) {
      await page.getByText(/open pulse/i).first().click();
      return;
    }
    const cont = page.getByText(/^continue$/i).first();
    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
      continue;
    }
    if (/for you|trending|activity/i.test(text)) return;
    await page.waitForTimeout(500);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeOnboarding(page);
await dismissCookies(page);

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
const hasSparkBar = /like syncs to spark|saved to likes|mi away/i.test(body);
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
