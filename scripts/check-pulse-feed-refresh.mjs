#!/usr/bin/env node
/**
 * Pulse feed reload — Instagram / YouTube style: re-tap Home at top (not scroll-to-top auto refresh).
 */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:8090';

async function waitForUpdated(page) {
  await page
    .getByText(/Updated just now|剛剛已更新/i)
    .first()
    .waitFor({ state: 'visible', timeout: 18000 })
    .catch(() => {});
  const body = await page.locator('body').innerText();
  return /Updated just now|剛剛已更新/i.test(body);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(20000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

await page.getByTestId('pulse-feed-refresh-footer').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

const homeTab = page.getByRole('tab', { name: /For You|為你|Home|首頁/i }).first();
await homeTab.click();
await page.waitForTimeout(350);
await homeTab.click();

const updated = await waitForUpdated(page);

console.log(
  JSON.stringify({ homeTabRepressRefresh: true, showsUpdatedState: updated }, null, 2),
);
await browser.close();
process.exit(updated ? 0 : 1);
