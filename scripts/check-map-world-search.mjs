#!/usr/bin/env node
/**
 * Map discover — worldwide pool shows pins after place search (Tokyo).
 */
import { chromium } from 'playwright';

import {
  completeDemoOnboarding,
  dismissCookies,
  enterPulseForYouFeed,
  unlockSparkFromPulse,
} from './demo-onboarding.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:8090';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(25000);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);
await unlockSparkFromPulse(page);
await page.waitForTimeout(400);

await page.getByLabel('Discover tools').first().click({ force: true });
await page.waitForTimeout(400);
await page.getByText(/^Map$/).first().click({ force: true });
await page.waitForTimeout(800);

await page.getByText(/^Places$/).first().click({ force: true });
const search = page.getByPlaceholder(/Search cities|neighborhood/i).first();
await search.fill('Tokyo');
await page.waitForTimeout(600);
await page.getByText(/Tokyo/i).first().click({ force: true });
await page.waitForTimeout(1200);

const meta = await page.locator('body').innerText();
const peopleMatch = meta.match(/·\s*(\d+)\s+people/i);
const count = peopleMatch ? Number(peopleMatch[1]) : 0;

let browseMatchesOk = false;
if (count >= 5) {
  const browse = page
    .getByRole('button', { name: /Browse \d+ (matches|people)/i })
    .or(page.getByText(/Browse \d+ matches/i))
    .first();
  if (await browse.isVisible().catch(() => false)) {
    await browse.click({ force: true });
    await page.waitForTimeout(800);
    browseMatchesOk = await page
      .getByText(/Matches in this area|此區域的配對/i)
      .first()
      .isVisible()
      .catch(() => false);
  }
}

const ok = count >= 5 && browseMatchesOk;

console.log(
  JSON.stringify({ worldMapSearch: true, tokyoPeopleCount: count, browseMatchesOk, ok }, null, 2),
);
await browser.close();
process.exit(ok ? 0 : 1);
