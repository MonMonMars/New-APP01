#!/usr/bin/env node
/**
 * Pulse taps must open the matching destination:
 * - News/disguised headlines → article sheet (Read on …)
 * - Sponsored ads → ad landing sheet
 * - Social → comments (not dating mini-window)
 * - Activity person rows → activity sheet; avatars → mini-window when explicit
 * - News/ad activity rows → article or ad sheet
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

async function hasArticleSheet(page) {
  return page
    .getByLabel(/Read on /)
    .first()
    .isVisible()
    .catch(() => false);
}

async function hasAdSheet(page) {
  const body = await page.locator('body').innerText();
  return /visit site|learn more|spotify|sponsored/i.test(body) && !(await hasMiniWindow(page));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(12000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

let avatarOk = false;
let captionOk = true;
let captionTextOk = false;
for (let scroll = 0; scroll < 16 && !avatarOk; scroll += 1) {
  const triggers = [
    page.getByLabel(/^View photos from /i).first(),
    page.getByLabel(/^View profile/i).first(),
  ];
  for (const trigger of triggers) {
    if (!(await trigger.isVisible().catch(() => false))) {
      continue;
    }
    await trigger.click({ force: true });
    await page.waitForTimeout(700);
    avatarOk = await hasMiniWindow(page);
    if (!avatarOk) {
      continue;
    }
    await page.getByLabel('Close').last().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    const caption = page.getByTestId('feed-person-caption').first();
    if (await caption.isVisible().catch(() => false)) {
      await caption.click({ force: true });
      await page.waitForTimeout(500);
      captionOk = !(await hasMiniWindow(page));
    }
    break;
  }
  if (avatarOk) {
    break;
  }
  await page.evaluate(() => window.scrollBy(0, 480));
  await page.waitForTimeout(350);
}

for (let scroll = 0; scroll < 14 && !captionTextOk; scroll += 1) {
  const captions = page.getByTestId('feed-person-caption');
  const count = await captions.count().catch(() => 0);
  for (let i = 0; i < count; i += 1) {
    const text = (await captions.nth(i).innerText().catch(() => '')).trim();
    if (text.length >= 8) {
      captionTextOk = true;
      break;
    }
  }
  if (captionTextOk) {
    break;
  }
  await page.evaluate(() => window.scrollBy(0, 420));
  await page.waitForTimeout(300);
}

const article = page.getByLabel(/Read article:/).first();
await article.click({ force: true });
await page.waitForTimeout(700);
const articleOk = (await hasArticleSheet(page)) && !(await hasMiniWindow(page));
await page.getByLabel('Close').last().click({ force: true }).catch(() => {});
await page.waitForTimeout(400);

let disguisedOk = true;
let disguisedReadOnOk = true;
let adOk = true;
let socialOk = true;

for (let scroll = 0; scroll < 12; scroll += 1) {
  const disguisedHeadline = page.getByLabel(/Read article:/).nth(1);
  if (disguisedOk && (await disguisedHeadline.isVisible().catch(() => false))) {
    await disguisedHeadline.click({ force: true });
    await page.waitForTimeout(700);
    disguisedOk = (await hasArticleSheet(page)) && !(await hasMiniWindow(page));
    if (disguisedOk) {
      const readOn = page.getByLabel(/Read on /).first();
      disguisedReadOnOk = await readOn.isVisible().catch(() => false);
    }
    await page.getByLabel('Close').last().click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
  }

  const adCard = page.getByLabel(/sponsored/i).first();
  if (adOk && (await adCard.isVisible().catch(() => false))) {
    await adCard.click({ force: true });
    await page.waitForTimeout(700);
    adOk = await hasAdSheet(page);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }

  const socialComments = page.getByLabel(/View comments|檢視留言/i).first();
  if (socialOk) {
    if (await socialComments.isVisible().catch(() => false)) {
      await socialComments.click({ force: true });
      await page.waitForTimeout(700);
      const body = await page.locator('body').innerText();
      socialOk = /comments|comment|reply|留言/i.test(body) && !(await hasMiniWindow(page));
      await page.getByLabel(/^Close$|^關閉$/i).last().click({ force: true }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }

  if (!disguisedOk || !adOk || !socialOk) {
    break;
  }
  if (disguisedOk && adOk && socialOk) {
    break;
  }
  await page.evaluate(() => window.scrollBy(0, 420));
  await page.waitForTimeout(300);
}

const activityTab = page.getByRole('tab', { name: /activity/i }).first();
await activityTab.click({ force: true });
await page.waitForTimeout(700);

const alertRow = page.getByText(/upvoted|commented|liked your/i).first();
await alertRow.click({ force: true });
await page.waitForTimeout(700);
const activityOk =
  (await page.locator('body').innerText()).match(/upvoted|activity|notification/i) &&
  !(await hasMiniWindow(page));
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(300);

const newsAlert = page.getByText(/BBC News:|NPR:|trending story/i).first();
let newsAlertOk = true;
if (await newsAlert.isVisible().catch(() => false)) {
  await newsAlert.click({ force: true });
  await page.waitForTimeout(700);
  newsAlertOk = (await hasArticleSheet(page)) && !(await hasMiniWindow(page));
  await page.getByLabel('Close').last().click({ force: true }).catch(() => {});
}

console.log(
  JSON.stringify(
    {
      articleOk,
      disguisedOk,
      disguisedReadOnOk,
      adOk,
      socialOk,
      avatarOk,
      captionOk,
      captionTextOk,
      activityOk,
      newsAlertOk,
    },
    null,
    2,
  ),
);

await browser.close();
const ok =
  articleOk &&
  disguisedOk &&
  disguisedReadOnOk &&
  adOk &&
  socialOk &&
  activityOk &&
  avatarOk &&
  captionOk &&
  captionTextOk &&
  newsAlertOk;
process.exit(ok ? 0 : 1);
