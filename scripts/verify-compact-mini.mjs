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

async function dismissCookies(page) {
  const btn = page.getByText(/essential only/i).first();
  if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(400);
  }
}

async function onboard(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
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

async function openMini(page) {
  const reporter = page.getByLabel(/^View photos from /).first();
  if (await reporter.count()) {
    await reporter.scrollIntoViewIfNeeded();
    await reporter.click({ force: true });
    await page.waitForTimeout(700);
    return;
  }
  const profile = page.getByLabel(/^View profile: /).first();
  await profile.scrollIntoViewIfNeeded();
  await profile.click({ force: true });
  await page.waitForTimeout(700);
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
    for (let i = 0; i < 12 && card; i += 1) {
      const w = card.getBoundingClientRect().width;
      if (w > 160 && w < 360) {
        const imgs = [...card.querySelectorAll('img')];
        const photo = imgs.find((img) => img.getBoundingClientRect().height > 40);
        const photoBox = photo ? photo.getBoundingClientRect() : null;
        const box = card.getBoundingClientRect();
        return {
          found: true,
          width: Math.round(box.width),
          height: Math.round(box.height),
          photoHeight: photoBox ? Math.round(photoBox.height) : 0,
          photoWidth: photoBox ? Math.round(photoBox.width) : 0,
          hasSparkBar: !!document.querySelector('[aria-label="Pass profile"]'),
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
    await dismissCookies(page);
    await shot(page, 'pulse_feed_compact.png');

    await openMini(page);
    await page.getByLabel('Super like profile', { exact: true }).waitFor({ timeout: 8000 });
    await shot(page, 'pulse_mini_window_compact.png');

    const metrics = await measureMini(page);
    console.log('mini_metrics', JSON.stringify(metrics));

    const like = page.getByLabel(/^(Like profile|Unlike profile)$/);
    const superLike = page.getByLabel('Super like profile', { exact: true });
    const pass = page.getByLabel('Pass profile', { exact: true });

    const likeBox = await like.boundingBox();
    const superBox = await superLike.boundingBox();
    const passBox = await pass.boundingBox();

    if (superBox && passBox && likeBox) {
      const superCentered = superBox.x > passBox.x && superBox.x < likeBox.x;
      console.log('super_is_center', superCentered ? 1 : 0);
      if (!superCentered) {
        throw new Error('super like button should sit between pass and like');
      }
      const sizes = [passBox, superBox, likeBox].map((b) => `${Math.round(b.width)}x${Math.round(b.height)}`);
      console.log('button_sizes', sizes.join(' '));
      if (passBox.width < 28 || passBox.width > 40) {
        throw new Error(`unexpected pass button size: ${passBox.width}`);
      }
    }

    await superLike.click({ force: true });
    await page.waitForTimeout(140);
    const duringDismiss = await page.locator('body').innerText();
    const dismissStatVisible = /super liked/i.test(duringDismiss);
    await shot(page, 'pulse_mini_super_dismiss_stat.png');
    await page.waitForTimeout(560);
    const closedAfterSuper = !(await page.getByLabel(/like profile|unlike profile|pass profile/i).first().isVisible().catch(() => false));
    console.log('dismiss_stat', dismissStatVisible, 'closed', closedAfterSuper);

    if (!metrics.found) {
      throw new Error('mini window not found');
    }
    if (metrics.width > 250) {
      throw new Error(`mini window still too wide: ${metrics.width}`);
    }
    if (metrics.photoHeight > 150) {
      throw new Error(`photo still too tall: ${metrics.photoHeight}`);
    }
    if (!metrics.hasSparkBar) {
      throw new Error('spark action bar missing from mini window');
    }
    if (!dismissStatVisible) {
      throw new Error('super like dismiss stat not visible');
    }
    if (!closedAfterSuper) {
      throw new Error('mini window did not close after super like dismiss');
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
