#!/usr/bin/env node
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:8090';

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
    await page.waitForTimeout(400);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeOnboarding(page);
const essential = page.getByText(/essential only/i).first();
if (await essential.isVisible({ timeout: 1500 }).catch(() => false)) {
  await essential.click();
}

const labels = await page.evaluate(() =>
  [...document.querySelectorAll('[aria-label]')]
    .map((el) => el.getAttribute('aria-label'))
    .filter(Boolean),
);

const personLabels = labels.filter((label) => /profile|news|ad|social/i.test(label));
await page.getByLabel(/view photos from/i).first().click();
await page.waitForTimeout(700);
const previewLabels = await page.evaluate(() =>
  [...document.querySelectorAll('[aria-label]')]
    .map((el) => el.getAttribute('aria-label'))
    .filter(Boolean),
);

const sparkOrder = previewLabels.filter((label) =>
  /pass profile|super like profile|like profile|unlike profile/i.test(label ?? ''),
);

console.log(JSON.stringify({
  hasProfileWord: /\bPROFILE\b/.test(await page.locator('body').innerText()),
  personLabels: personLabels.slice(0, 12),
  sparkOrder,
  previewHasProfileIcon: previewLabels.includes('Profile'),
}, null, 2));

await browser.close();
process.exit(sparkOrder[0] === 'Pass profile' && sparkOrder[1] === 'Super like profile' ? 0 : 1);
