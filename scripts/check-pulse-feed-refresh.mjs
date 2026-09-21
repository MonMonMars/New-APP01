#!/usr/bin/env node
/**
 * Pulse feed reload via footer tap (web-friendly alternative to pull-to-refresh).
 */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:8090';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(15000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

for (let i = 0; i < 6; i += 1) {
  await page.evaluate(() => window.scrollBy(0, 520));
  await page.waitForTimeout(250);
}

const footerBtn = page.getByLabel(/^Refresh Pulse feed$/i);
await footerBtn.scrollIntoViewIfNeeded().catch(() => {});
await footerBtn.click({ force: true });
await page.waitForTimeout(400);

const loadingVisible = await page.getByText(/Loading latest stories/i).isVisible().catch(() => false);
await page.getByText(/Updated just now/i).waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

const body = await page.locator('body').innerText();
const updated =
  /Updated just now|剛剛已更新/i.test(body) ||
  loadingVisible ||
  (await page.getByText(/Updated just now|剛剛已更新/i).first().isVisible().catch(() => false));

console.log(JSON.stringify({ footerRefreshTapped: true, showsUpdatedState: updated }, null, 2));
await browser.close();
process.exit(updated ? 0 : 1);
