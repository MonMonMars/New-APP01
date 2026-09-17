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

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  page.setDefaultTimeout(12000);
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

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
    if (await pulseBtn.count()) {
      await pulseBtn.click();
    } else {
      const pulseText = page.getByText('Pulse', { exact: true }).first();
      const box = await pulseText.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 24, box.y + box.height / 2);
      }
    }
    await page.waitForTimeout(800);
    const leaveText = await page.getByText('Leave Pulse?').count();
    const leaveSpark = await page.getByText('Leave Spark').count();
    console.log('leave_pulse_count', leaveText, 'leave_spark_count', leaveSpark);
    await page.waitForTimeout(500);
    await shot(page, 'leave_pulse_confirm.png');
    const policy = await page.getByText('Disguise mode policy').count();
    console.log('policy_sheet_visible', policy > 0);
    await clickText(page, 'Leave Spark');
    await page.waitForTimeout(900);
    await shot(page, 'spark_discover.png');

    const world = page.getByLabel(/Spark\. Switch world|Ember\. Switch world/).first();
    await world.click({ force: true });
    await page.waitForTimeout(500);
    await shot(page, 'world_picker_centered.png');
    await page.getByLabel(/Ember\. Married group/).click({ force: true });
    await page.waitForTimeout(600);
    await shot(page, 'ember_discover.png');

    const emergency = page.getByLabel(/Emergency — switch to Harbor disguise mode/).first();
    await emergency.click({ force: true });
    await page.waitForTimeout(800);
    await shot(page, 'harbor_header.png');
    const harborMarks = await page.getByLabel('Harbor').count();
    console.log('harbor_mark_count', harborMarks);

    const harborLogo = page.getByLabel(/Tap Harbor logo to leave Ember/).first();
    await harborLogo.click({ force: true });
    await page.waitForTimeout(500);
    await shot(page, 'leave_harbor_confirm.png');
    await clickText(page, 'Stay');
    await page.waitForTimeout(400);
    await harborLogo.click({ force: true });
    await page.waitForTimeout(400);
    await clickText(page, 'Leave Ember');
    await page.waitForTimeout(800);

    const tools = page.getByLabel('Discover tools').first();
    await tools.click({ force: true });
    await page.waitForTimeout(500);
    await page.getByText('Radius', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(600);
    await shot(page, 'expand_search_map.png');
    const mapVisible = await page.getByText('Expand search').count();
    console.log('expand_search_title', mapVisible > 0);

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
