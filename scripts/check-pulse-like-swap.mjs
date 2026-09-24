#!/usr/bin/env node
/**
 * Pulse upvote/remove must swap the woven profile avatar + beside caption on the same card.
 */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:8090';

async function snapshotFromUpvote(page, upvoteLocator) {
  const handle = await upvoteLocator.elementHandle();
  if (!handle) {
    return { caption: '', avatarSrc: '' };
  }
  return page.evaluate((button) => {
    let node = button;
    for (let depth = 0; depth < 14 && node; depth += 1) {
      const caption = node.querySelector?.('[data-testid="feed-person-caption"]');
      const img = node.querySelector?.('img');
      if (caption && img) {
        return {
          caption: (caption.textContent ?? '').trim(),
          avatarSrc: img.currentSrc || img.src || '',
        };
      }
      node = node.parentElement;
    }
    return { caption: '', avatarSrc: '' };
  }, handle);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(15000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);

let postTestId = null;
let before = null;

for (let scroll = 0; scroll < 18; scroll += 1) {
  const upvotes = page.locator('[data-testid^="pulse-post-upvote-"]');
  const count = await upvotes.count();
  for (let i = 0; i < count; i += 1) {
    const candidate = upvotes.nth(i);
    if (!(await candidate.isVisible().catch(() => false))) {
      continue;
    }
    const snap = await snapshotFromUpvote(page, candidate);
    if (snap.caption.length >= 6 && snap.avatarSrc.length > 0) {
      postTestId = (await candidate.getAttribute('data-testid')) ?? '';
      before = snap;
      break;
    }
  }
  if (postTestId) {
    break;
  }
  await page.evaluate(() => window.scrollBy(0, 420));
  await page.waitForTimeout(350);
}

const result = {
  foundUpvote: Boolean(postTestId),
  postTestId,
  before,
  afterLike: null,
  afterUnlike: null,
  swappedOnLike: false,
  revertedOnUnlike: false,
  ok: false,
};

if (!postTestId || !before) {
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  process.exit(1);
}

const cardUpvote = page.locator(`[data-testid="${postTestId}"]`);

await cardUpvote.click({ force: true });
await page.waitForTimeout(700);

const afterLike = await snapshotFromUpvote(page, cardUpvote);
result.afterLike = afterLike;
result.swappedOnLike =
  (afterLike.avatarSrc !== before.avatarSrc || afterLike.caption !== before.caption) &&
  afterLike.caption.length >= 6;

await cardUpvote.click({ force: true });
await page.waitForTimeout(700);

const afterUnlike = await snapshotFromUpvote(page, cardUpvote);
result.afterUnlike = afterUnlike;
result.revertedOnUnlike =
  afterUnlike.avatarSrc === before.avatarSrc && afterUnlike.caption === before.caption;

result.ok = result.swappedOnLike && result.revertedOnUnlike;

console.log(JSON.stringify(result, null, 2));
await browser.close();
process.exit(result.ok ? 0 : 1);
