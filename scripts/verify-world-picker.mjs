import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.DEMO_URL || 'http://localhost:8090';
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

const dismissOnboarding = async (page) => {
  if (await page.getByText('Continue without account').count()) {
    await clickText(page, 'Continue without account');
    await page.waitForTimeout(400);
    await clickText(page, 'I have read and agree to the policies above');
    await page.waitForTimeout(200);
    await clickText(page, 'Continue — I am 18+');
    await page.waitForTimeout(300);
    await clickText(page, 'Use my location');
    await page.waitForTimeout(300);
    await clickText(page, 'Continue');
    await page.waitForTimeout(300);
    await clickText(page, 'Continue');
    await page.waitForTimeout(300);
    await page.getByText(/^Open /).first().click({ force: true });
    await page.waitForTimeout(800);
  }

  const cookie = page.getByText('Accept', { exact: true });
  if (await cookie.count()) {
    await cookie.click({ force: true }).catch(() => {});
  }
};

const unlockSparkIfNeeded = async (page) => {
  const pulseBtn = page.getByRole('button', { name: /Tap Pulse logo to leave Spark/ });
  if (await pulseBtn.count()) {
    await pulseBtn.click();
    await page.waitForTimeout(400);
    if (await page.getByText('Leave Spark').count()) {
      await clickText(page, 'Leave Spark');
      await page.waitForTimeout(700);
    }
  }
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
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await dismissOnboarding(page);
    await unlockSparkIfNeeded(page);
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
    const sheet = page.locator('text=Choose a world').locator('xpath=ancestor::*[contains(@style,"max-width") or contains(@class,"css")][1]');
    const dialog = page.getByRole('dialog');
    const dialogBox = (await dialog.boundingBox().catch(() => null)) ?? box;
    const card = page.getByText('Anyone can join either section').first();
    const cardBox = await card.boundingBox();
    const cardCenterY = cardBox ? cardBox.y + cardBox.height / 2 : titleCenterY;
    const mid = viewport.height / 2;
    const offsetFromMid = Math.abs(cardCenterY - mid);

    console.log(JSON.stringify({
      viewport,
      titleBox: box,
      dialogBox,
      cardBox,
      titleCenterY,
      cardCenterY,
      mid,
      offsetFromMid,
    }));

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

    await page.getByText('Likes').first().click({ force: true });
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
