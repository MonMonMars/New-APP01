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

async function openMiniWindow(page, index = 0) {
  const thumb = page.getByLabel(/view photos from/i).nth(index);
  const label = (await thumb.getAttribute('aria-label')) ?? '';
  await thumb.click();
  await page.waitForTimeout(600);
  return label.replace(/^View photos from\s+/i, '').trim();
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
await completeOnboarding(page);
await dismissCookies(page);

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
  reporterRemovedAfterLike &&
  hasPass &&
  passStatVisible &&
  closedAfterPass &&
  hasSuper &&
  superStatVisible &&
  closedAfterSuper;

process.exit(ok ? 0 : 1);
