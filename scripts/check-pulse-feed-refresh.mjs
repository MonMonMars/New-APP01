#!/usr/bin/env node
/**
 * Pulse feed reload — scroll to top or re-tap Home (Instagram / YouTube style).
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

async function pulseFeedScroller(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll('div')];
    return nodes.find(
      (node) => node.scrollHeight > node.clientHeight + 80 && node.clientHeight > 320,
    );
  });
}

async function scrollPulseFeed(page, scrollTop) {
  await page.evaluate((top) => {
    const nodes = [...document.querySelectorAll('div')];
    const scroller = nodes.find(
      (node) => node.scrollHeight > node.clientHeight + 80 && node.clientHeight > 320,
    );
    if (!scroller) {
      return;
    }
    scroller.scrollTop = top;
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
  }, scrollTop);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(20000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

const scroller = await pulseFeedScroller(page);
await scrollPulseFeed(page, 3200);
await page.waitForTimeout(250);
await scrollPulseFeed(page, 0);
await page.waitForTimeout(1200);

let updated = await waitForUpdated(page);
let sawGreyChrome = await page
  .getByTestId('pulse-feed-refresh-top-chrome')
  .isVisible()
  .catch(() => false);

if (!updated) {
  const homeTab = page.getByRole('tab', { name: /For You|為你|Home|首頁/i }).first();
  await homeTab.click();
  await page.waitForTimeout(900);
  await homeTab.click();
  await page.waitForTimeout(1200);
  updated = await waitForUpdated(page);
  sawGreyChrome =
    sawGreyChrome ||
    (await page
      .getByTestId('pulse-feed-refresh-top-chrome')
      .isVisible()
      .catch(() => false));
}

console.log(
  JSON.stringify(
    {
      scrollToTopRefresh: Boolean(scroller),
      showsUpdatedState: updated,
      sawGreyReloadChrome: sawGreyChrome,
    },
    null,
    2,
  ),
);
await browser.close();
process.exit(updated ? 0 : 1);
