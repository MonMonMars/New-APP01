import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

import {
  completeDemoOnboarding,
  dismissCookies,
  enterPulseForYouFeed,
  unlockSparkFromPulse,
} from './demo-onboarding.mjs';

const BASE = process.env.DEMO_URL || 'http://127.0.0.1:8090';
const OUT = process.env.SCREENSHOT_DIR || '/opt/cursor/artifacts/screenshots';
mkdirSync(OUT, { recursive: true });

const shot = async (page, name) => {
  const file = join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
  return file;
};

const clickText = async (page, text, timeout = 8000) => {
  const loc = page.getByText(text, { exact: true }).first();
  await loc.waitFor({ timeout });
  await loc.scrollIntoViewIfNeeded();
  await loc.click({ force: true });
};

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  page.setDefaultTimeout(12000);
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await completeDemoOnboarding(page);
    await dismissCookies(page);
    await enterPulseForYouFeed(page);

    await page.waitForTimeout(600);
    await shot(page, 'pulse_header_one_logo.png');

    const pulseMarks = await page.getByLabel('Pulse').count();
    console.log('pulse_mark_count', pulseMarks);

    await page.evaluate(() => window.scrollTo(0, 420));
    await page.waitForTimeout(400);
    await shot(page, 'pulse_feed_captions.png');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const pulseBtn = page.getByRole('button', { name: /Tap Pulse logo to leave Spark/ });
    console.log('pulse_btn_count', await pulseBtn.count());
    await unlockSparkFromPulse(page);
    await page.waitForTimeout(500);
    await shot(page, 'leave_pulse_confirm.png');
    await shot(page, 'spark_discover.png');

    const world = page.getByLabel(/Spark\. Switch world|Ember\. Switch world/).first();
    await world.click({ force: true });
    await page.waitForTimeout(500);
    await shot(page, 'world_picker_centered.png');
    await page.getByLabel(/Ember\. Married group/).click({ force: true });
    await page.waitForTimeout(600);
    await shot(page, 'ember_discover.png');

    const tools = page.getByLabel('Discover tools').first();
    await tools.click({ force: true });
    await page.waitForTimeout(500);
    await page.getByText('Discover tools', { exact: true }).waitFor({ timeout: 8000 });
    await page.getByText(/^Map$/).first().click({ force: true });
    await page.waitForTimeout(600);
    await shot(page, 'expand_search_map.png');
    const searchAreaVisible = await page.getByText(/Search this area|搜尋此區域/i).count();
    console.log('map_search_this_area', searchAreaVisible > 0);
    if (searchAreaVisible === 0) {
      throw new Error('Full-screen map discover not visible');
    }

    await browser.close();
    console.log('ok');
  } catch (err) {
    await shot(page, 'verify_failure.png').catch(() => {});
    await browser.close().catch(() => {});
    throw err;
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
