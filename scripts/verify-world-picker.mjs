import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

import {
  completeDemoOnboarding,
  dismissCookies,
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

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: '/opt/cursor/artifacts',
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(14000);

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await completeDemoOnboarding(page);
    await dismissCookies(page);

    const inPulse = await page
      .getByLabel(/tap .+ logo to leave/i)
      .first()
      .isVisible()
      .catch(() => false);
    if (inPulse) {
      await unlockSparkFromPulse(page);
      await dismissCookies(page);
    }

    const onDiscover = /miles away|\d+\s*mi\b/i.test(await page.locator('body').innerText());
    if (!onDiscover) {
      throw new Error('expected Spark discover before world picker');
    }

    await shot(page, 'spark_discover_before_picker.png');

    const world = page.getByLabel(/Spark\. Switch world|Ember\. Switch world/).first();
    await world.waitFor({ timeout: 8000 });
    await world.click({ force: true });
    await page.waitForTimeout(450);

    const title = page.getByText('Choose a world', { exact: true }).first();
    await title.waitFor({ timeout: 5000 });
    const box = await title.boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) {
      throw new Error('missing picker box or viewport');
    }

    const titleCenterY = box.y + box.height / 2;
    const card = page.getByText('Anyone can join either section').first();
    const cardBox = await card.boundingBox();
    const cardCenterY = cardBox ? cardBox.y + cardBox.height / 2 : titleCenterY;
    const mid = viewport.height / 2;
    const offsetFromMid = Math.abs(cardCenterY - mid);

    console.log(
      JSON.stringify({
        viewport,
        titleBox: box,
        cardBox,
        titleCenterY,
        cardCenterY,
        mid,
        offsetFromMid,
      }),
    );

    if (titleCenterY > viewport.height * 0.72) {
      throw new Error(`world picker still near the bottom: titleCenterY=${titleCenterY}`);
    }
    if (offsetFromMid > 220) {
      throw new Error(`world picker not centered: offsetFromMid=${offsetFromMid}`);
    }

    await shot(page, 'world_picker_centered.png');

    const ember = page.getByLabel(/Ember\./).first();
    const emberBox = await ember.boundingBox();
    if (!emberBox) {
      throw new Error('ember row missing');
    }
    await page.mouse.move(emberBox.x + emberBox.width / 2, emberBox.y + emberBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(140);
    await shot(page, 'world_row_press.png');
    await page.mouse.up();
    await page.waitForTimeout(500);
    await shot(page, 'ember_after_world_select.png');

    const tools = page.getByLabel('Discover tools').first();
    const toolsBox = await tools.boundingBox();
    if (toolsBox) {
      await page.mouse.move(toolsBox.x + toolsBox.width / 2, toolsBox.y + toolsBox.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(140);
      await shot(page, 'hub_button_press.png');
      await page.mouse.up();
    }

    const hubBack = page.getByLabel(/back|close/i).first();
    if (await page.getByText('Discover tools', { exact: true }).isVisible().catch(() => false)) {
      if (await hubBack.isVisible().catch(() => false)) {
        await hubBack.click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }

    const likesTab = page.getByRole('tab', { name: /likes/i }).first();
    if (await likesTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await likesTab.click({ force: true });
      await page.waitForTimeout(500);
      const chip = page.getByLabel(/Spark\. Switch world|Ember\. Switch world/).first();
      await chip.click({ force: true });
      await page.waitForTimeout(450);
      const likesTitle = page.getByText('Choose a world', { exact: true }).first();
      await likesTitle.waitFor({ timeout: 4000 });
      const likesBox = await likesTitle.boundingBox();
      console.log('likes_picker_title_y', likesBox && likesBox.y);
      if (likesBox && likesBox.y > 620) {
        throw new Error(`likes picker near bottom: y=${likesBox.y}`);
      }
      await shot(page, 'likes_world_picker_centered.png');
    } else {
      console.log('likes_picker_skip', 'Likes tab not on current shell');
    }

    const videoPath = await page.video()?.path();
    await context.close();
    await browser.close();
    console.log('video', videoPath);
    console.log('ok');
  } catch (err) {
    await shot(page, 'world_picker_verify_failure.png').catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    throw err;
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
