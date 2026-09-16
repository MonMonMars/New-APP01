#!/usr/bin/env node
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/check-mini-window.mjs <url>');
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
    if (/for you|trending/i.test(text)) return;
    await page.waitForTimeout(500);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeOnboarding(page);
await dismissCookies(page);

const thumb = page.getByLabel(/view photos from/i).first();
await thumb.click();
await page.waitForTimeout(800);

const body = await page.locator('body').innerText();
const hasPhotoMeta = /photo 1 of \d+/i.test(body);
const hasProfileWord = /\bPROFILE\b/.test(body);
const hasNext = await page.getByLabel(/next photo/i).isVisible().catch(() => false);

if (hasPhotoMeta && hasNext) {
  await page.getByLabel(/next photo/i).click();
  await page.waitForTimeout(500);
}
const after = await page.locator('body').innerText();
const advanced = /photo 2 of/i.test(after);

console.log(JSON.stringify({
  hasPhotoMeta,
  hasNext,
  advanced,
  hasProfileWord,
  sample: after.slice(0, 600),
}, null, 2));

await browser.close();
process.exit(hasPhotoMeta && hasNext && advanced && !hasProfileWord ? 0 : 1);
