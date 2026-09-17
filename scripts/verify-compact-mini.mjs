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

async function onboard(page) {
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
    await page.waitForTimeout(900);
  }

  const cookie = page.getByText('Accept', { exact: true });
  if (await cookie.count()) {
    await cookie.click({ force: true }).catch(() => {});
  }
}

async function openMini(page) {
  const reporter = page.getByLabel(/^View photos from /).first();
  if (await reporter.count()) {
    await reporter.scrollIntoViewIfNeeded();
    await reporter.click({ force: true });
    await page.waitForTimeout(500);
    return;
  }
  const profile = page.getByLabel(/^View profile: /).first();
  await profile.scrollIntoViewIfNeeded();
  await profile.click({ force: true });
  await page.waitForTimeout(500);
}

async function measureMini(page) {
  return page.evaluate(() => {
    const names = [...document.querySelectorAll('div,span,p')].filter((el) => {
      const t = (el.textContent || '').trim();
      return /, \d{2}$/.test(t) && t.length < 40 && el.childElementCount === 0;
    });
    const nameEl = names[0];
    if (!nameEl) {
      return { found: false };
    }
    let card = nameEl.parentElement;
    for (let i = 0; i < 10 && card; i += 1) {
      const w = card.getBoundingClientRect().width;
      if (w > 160 && w < 360) {
        const imgs = [...card.querySelectorAll('img')];
        const photo = imgs.find((img) => img.getBoundingClientRect().height > 40);
        const photoBox = photo ? photo.getBoundingClientRect() : null;
        const box = card.getBoundingClientRect();
        const html = card.innerHTML;
        return {
          found: true,
          width: Math.round(box.width),
          height: Math.round(box.height),
          photoHeight: photoBox ? Math.round(photoBox.height) : 0,
          photoWidth: photoBox ? Math.round(photoBox.width) : 0,
          hasHeartIcon: /heart/i.test(html),
          hasThumbs: /thumbs-up|thumbs_up/i.test(html) || !!document.querySelector('[aria-label="Like profile"]'),
          hasFlash: /flash/i.test(html) || !!document.querySelector('[aria-label="Super like profile"]'),
          hasClose: !!document.querySelector('[aria-label="Pass profile"]'),
        };
      }
      card = card.parentElement;
    }
    return { found: false };
  });
}

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  page.setDefaultTimeout(14000);

  try {
    await onboard(page);
    await shot(page, 'pulse_feed_compact.png');

    await openMini(page);
    await page.getByLabel('Super like profile', { exact: true }).waitFor({ timeout: 8000 });
    await shot(page, 'pulse_mini_window_compact.png');

    const metrics = await measureMini(page);
    console.log('mini_metrics', JSON.stringify(metrics));

    const like = page.getByLabel(/^(Like profile|Unlike profile)$/);
    const superLike = page.getByLabel('Super like profile', { exact: true });
    const pass = page.getByLabel('Pass profile', { exact: true });
    const heartButtons = page.getByLabel(/heart/i);
    console.log('like_count', await like.count());
    console.log('super_count', await superLike.count());
    console.log('pass_count', await pass.count());
    console.log('heart_label_count', await heartButtons.count());

    const likeBox = await like.boundingBox();
    const superBox = await superLike.boundingBox();
    const passBox = await pass.boundingBox();
    console.log('pass_x', passBox?.x);
    console.log('super_x', superBox?.x);
    console.log('like_x', likeBox?.x);
    if (superBox && passBox && likeBox) {
      console.log('super_is_center', superBox.x > passBox.x && superBox.x < likeBox.x ? 1 : 0);
    }

    await superLike.click({ force: true });
    await page.waitForTimeout(400);
    await shot(page, 'pulse_mini_superliked.png');
    const superHint = await page.getByText(/Super liked — saved to Spark/).count();
    console.log('super_hint', superHint);

    await like.click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    const savedHint = await page.getByText(/Saved to Likes|Super liked/).count();
    console.log('saved_hint', savedHint);

    if (!metrics.found) {
      throw new Error('mini window not found');
    }
    if (metrics.width > 250) {
      throw new Error(`mini window still too wide: ${metrics.width}`);
    }
    if (metrics.photoHeight > 120) {
      throw new Error(`photo still too tall: ${metrics.photoHeight}`);
    }
    if (metrics.hasHeartIcon) {
      throw new Error('heart markup still present in Pulse mini window');
    }

    await browser.close();
    console.log('ok');
  } catch (err) {
    await shot(page, 'compact_mini_failure.png').catch(() => {});
    await browser.close().catch(() => {});
    throw err;
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
