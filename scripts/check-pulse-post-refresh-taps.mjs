#!/usr/bin/env node
/** Pulse feed: after refresh, feed cards and footer should still be clickable. */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:8090';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(22000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

const homeTab = page.getByRole('tab', { name: /For You|為你|Home|首頁/i }).first();
await homeTab.click();
await page.waitForTimeout(350);
await homeTab.click();
await page.getByText(/Updated just now|剛剛已更新/i).first().waitFor({ state: 'visible', timeout: 12000 });

async function dismissLeavePulseIfOpen(page) {
  const leaveTitle = page.getByText(/Leave Pulse\?|離開 Pulse/i).first();
  if (!(await leaveTitle.isVisible({ timeout: 400 }).catch(() => false))) {
    return;
  }
  const backdropClose = page.getByLabel(/^Close$|^關閉$/i).last();
  if (await backdropClose.isVisible().catch(() => false)) {
    await backdropClose.click();
  } else {
    await page.getByText(/^Stay$|^留在/i).first().click({ force: true });
  }
  await page.waitForTimeout(400);
}

await dismissLeavePulseIfOpen(page);

const headline = page.locator('[role="button"]').filter({ hasText: /./ }).first();
const headlineText = (await headline.innerText().catch(() => '')).slice(0, 40);
await headline.click({ timeout: 8000 });
const sheetOpen = await page
  .getByRole('button', { name: /close|關閉/i })
  .first()
  .isVisible({ timeout: 5000 })
  .catch(() => false);

if (sheetOpen) {
  await page.getByRole('button', { name: /close|關閉/i }).first().click();
  await page
    .getByRole('button', { name: /close|關閉/i })
    .first()
    .waitFor({ state: 'hidden', timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  await dismissLeavePulseIfOpen(page);
}

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await dismissLeavePulseIfOpen(page);

const footerVisible = await page.getByTestId('pulse-feed-refresh-footer').isVisible();

console.log(
  JSON.stringify(
    {
      postTabRefreshArticleTap: sheetOpen,
      headlineSample: headlineText,
      footerVisible,
    },
    null,
    2,
  ),
);

await browser.close();
process.exit(sheetOpen && footerVisible ? 0 : 1);
