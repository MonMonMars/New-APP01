import { chromium } from 'playwright';

import {
  completeDemoOnboarding,
  dismissCookies,
  enterPulseForYouFeed,
  unlockSparkFromPulse,
} from './demo-onboarding.mjs';

const BASE = process.env.DEMO_URL || 'http://127.0.0.1:8090';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(12000);

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await completeDemoOnboarding(page, { gender: 'woman' });
    await dismissCookies(page);
    await enterPulseForYouFeed(page);

    const body = await page.locator('body').innerText();
    const checks = {
      female_zodiac_feed: /Virgo|Tarot|星座|Cosmos|Entertainment/i.test(body),
      no_duplicate_pulse_wordmark: (await page.getByText('Pulse', { exact: true }).count()) <= 1,
      cosmos_tab: (await page.getByRole('tab', { name: /cosmos/i }).count()) > 0,
      header_leave_btn: (await page.getByRole('button', { name: /Tap Pulse logo to leave Spark/ }).count()) === 1,
    };

    const cosmosTab = page.getByRole('tab', { name: /cosmos/i }).first();
    await cosmosTab.click({ force: true });
    await page.waitForTimeout(700);
    const cosmosBody = await page.locator('body').innerText();
    checks.cosmos_screen = /Cosmos & culture|Tonight for you|Tarot|星座/i.test(cosmosBody);
    checks.no_markets_on_female_cosmos = !/Stock market/i.test(cosmosBody);

    await unlockSparkFromPulse(page);
    await dismissCookies(page);

    await page.getByRole('tab', { name: 'Likes' }).click({ force: true });
    await page.waitForTimeout(700);
    const likesBody = await page.locator('body').innerText();
    checks.likes_reveal_free = /See who liked you and match back instantly/i.test(likesBody);
    checks.no_paywall_banner = !/Upgrade to Spark\+ to see who they are/i.test(likesBody);

    await page.getByRole('tab', { name: /pulse disguise mode/i }).click({ force: true });
    await page.waitForTimeout(500);
    await page.getByLabel('Discover tools').click({ force: true });
    await page.getByText('Discover tools', { exact: true }).waitFor({ timeout: 8000 });
    await page.waitForTimeout(400);
    const hubBody = await page.locator('body').innerText();
    const likesMatch = hubBody.match(/(\d+) likes left today/i);
    checks.female_like_quota = likesMatch !== null && Number(likesMatch[1]) >= 25;
    if (!checks.female_like_quota) {
      console.log('hub_likes_line', likesMatch?.[0] ?? 'missing');
    }

    console.log(JSON.stringify(checks, null, 2));
    const failed = Object.entries(checks).filter(([, ok]) => !ok);
    if (failed.length) {
      throw new Error(`Failed checks: ${failed.map(([k]) => k).join(', ')}`);
    }
    console.log('ok');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
