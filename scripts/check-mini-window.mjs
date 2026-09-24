#!/usr/bin/env node
import { chromium } from 'playwright';

import {
  completeDemoOnboarding,
  dismissCookies,
  enterPulseForYouFeed,
} from './demo-onboarding.mjs';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/check-mini-window.mjs <url>');
  process.exit(1);
}

async function findMiniWindowTrigger(page, index = 0) {
  const selectors = [
    page.getByLabel(/^View photos from /i),
    page.getByLabel(/^View profile/i),
  ];
  for (const locator of selectors) {
    const count = await locator.count().catch(() => 0);
    if (count > index) {
      return locator.nth(index);
    }
  }
  return null;
}

async function openMiniWindow(page, index = 0) {
  for (let scroll = 0; scroll < 14; scroll += 1) {
    const thumb = await findMiniWindowTrigger(page, index);
    if (thumb && (await thumb.isVisible().catch(() => false))) {
      const label = (await thumb.getAttribute('aria-label')) ?? '';
      await thumb.click({ force: true });
      await page.waitForTimeout(600);
      const name = label
        .replace(/^View photos from\s+/i, '')
        .replace(/^View profile:?\s+/i, '')
        .trim();
      const opened = await page
        .getByLabel(/like profile|pass profile/i)
        .first()
        .isVisible()
        .catch(() => false);
      if (opened) {
        return name;
      }
    }
    await page.mouse.wheel(0, 520);
    await page.waitForTimeout(350);
  }
  throw new Error('No Pulse mini-window trigger found in feed');
}

async function waitForDismiss(page) {
  await page.waitForTimeout(340);
}

async function statVisible(page, pattern) {
  await page.waitForTimeout(80);
  const text = await page.locator('body').innerText();
  return pattern.test(text);
}

async function sheetClosed(page) {
  return !(await page.getByLabel(/like profile|pass profile/i).first().isVisible().catch(() => false));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

const reporterName = await openMiniWindow(page, 0);

const body = await page.locator('body').innerText();
const hasPhotoMeta = /photo 1 of \d+/i.test(body);
const hasProfileWord = /\bPROFILE\b/.test(body);
const hasNext = await page.getByLabel(/next photo/i).isVisible().catch(() => false);

if (hasPhotoMeta && hasNext) {
  await page.getByLabel(/next photo/i).click();
  await page.waitForTimeout(400);
}
const afterSwipe = await page.locator('body').innerText();
const advanced = /photo 2 of/i.test(afterSwipe);

const likeBtn = page.getByLabel(/like profile/i).first();
const hasLike = await likeBtn.isVisible().catch(() => false);
let likeStatVisible = false;
let closedAfterLike = false;
let reporterRemovedAfterLike = false;

if (hasLike) {
  await likeBtn.click();
  likeStatVisible = await statVisible(page, /\bSAVED\b/i);
  await waitForDismiss(page);
  closedAfterLike = await sheetClosed(page);
  const feedAfterLike = await page.locator('body').innerText();
  reporterRemovedAfterLike =
    reporterName.length > 0 && !feedAfterLike.includes(reporterName.split(' ')[0]);
}

await openMiniWindow(page, 0);
const passBtn = page.getByLabel(/pass profile/i).first();
const hasPass = await passBtn.isVisible().catch(() => false);
let passStatVisible = false;
let closedAfterPass = false;

if (hasPass) {
  await passBtn.click();
  passStatVisible = await statVisible(page, /\bPASSED\b/i);
  await waitForDismiss(page);
  closedAfterPass = await sheetClosed(page);
}

await openMiniWindow(page, 0);
const superBtn = page.getByLabel(/super like profile/i).first();
const hasSuper = await superBtn.isVisible().catch(() => false);
let superStatVisible = false;
let closedAfterSuper = false;

if (hasSuper) {
  await superBtn.click();
  superStatVisible = await statVisible(page, /super liked/i);
  await waitForDismiss(page);
  closedAfterSuper = await sheetClosed(page);
}

console.log(JSON.stringify({
  reporterName,
  hasPhotoMeta,
  hasNext,
  advanced,
  hasProfileWord,
  hasLike,
  likeStatVisible,
  closedAfterLike,
  reporterRemovedAfterLike,
  hasPass,
  passStatVisible,
  closedAfterPass,
  hasSuper,
  superStatVisible,
  closedAfterSuper,
}, null, 2));

await browser.close();

const ok =
  hasPhotoMeta &&
  hasNext &&
  advanced &&
  !hasProfileWord &&
  hasLike &&
  likeStatVisible &&
  closedAfterLike &&
  hasPass &&
  passStatVisible &&
  closedAfterPass &&
  hasSuper &&
  superStatVisible &&
  closedAfterSuper;

process.exit(ok ? 0 : 1);
