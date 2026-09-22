#!/usr/bin/env node
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2] ?? 'http://localhost:8090';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);
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
