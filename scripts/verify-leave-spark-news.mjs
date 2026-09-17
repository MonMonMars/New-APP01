import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.DEMO_URL || 'http://localhost:8090';
const OUT = process.env.SCREENSHOT_DIR || '/opt/cursor/artifacts';
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

const imageStats = async (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('img')].map((img) => ({
      src: img.currentSrc || img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
    })),
  );

const main = async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  page.setDefaultTimeout(15000);

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

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
      await page.waitForTimeout(1200);
    }

    const cookie = page.getByText('Accept', { exact: true });
    if (await cookie.count()) {
      await cookie.click({ force: true }).catch(() => {});
    }

    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText();
    console.log('unlock_spark_visible', /Unlock Spark/i.test(body));
    console.log('leave_spark_in_body', /Leave Spark/i.test(body));
    console.log('for_you_or_news', /For you|BBC|Guardian|NPR/i.test(body));

    await shot(page, 'pulse_feed_news_photos.png');
    const feedImgs = await imageStats(page);
    const newsImgs = feedImgs.filter(
      (img) => /pexels|unsplash/i.test(img.src) && img.clientWidth >= 40,
    );
    console.log(
      'feed_news_images',
      JSON.stringify(
        newsImgs.map((img) => ({
          host: img.src.split('/')[2],
          naturalWidth: img.naturalWidth,
          clientWidth: img.clientWidth,
          clientHeight: img.clientHeight,
        })),
        null,
        2,
      ),
    );
    const loadedNews = newsImgs.filter((img) => img.naturalWidth > 40);
    console.log('loaded_news_photo_count', loadedNews.length);

    const articleCard = page.getByLabel(/Read article:/).first();
    await articleCard.waitFor({ timeout: 8000 });
    await articleCard.click({ force: true });
    await page.waitForTimeout(900);
    await shot(page, 'pulse_article_hero.png');

    const readOn = page.getByLabel(/Read on /).first();
    const readLabel = (await readOn.getAttribute('aria-label')) ?? '';
    console.log('read_on_label', readLabel);

    const articleImgs = await imageStats(page);
    const hero = articleImgs.find((img) => img.clientWidth >= 200);
    console.log(
      'article_hero',
      hero
        ? {
            src: hero.src.slice(0, 120),
            naturalWidth: hero.naturalWidth,
            clientHeight: hero.clientHeight,
          }
        : null,
    );

    const hrefProbe = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('[aria-label^="Read on"]')];
      return buttons.map((el) => el.getAttribute('aria-label'));
    });
    console.log('read_on_labels', hrefProbe);

    await page.getByLabel('Close').last().click({ force: true });
    await page.getByText('Read on BBC News').first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);

    const pulseBtn = page.getByRole('button', { name: /Tap Pulse logo to leave Spark/ });
    console.log('pulse_leave_btn_count', await pulseBtn.count());
    if (await pulseBtn.count()) {
      await pulseBtn.click({ force: true });
    } else {
      await page.getByLabel(/leave Spark/i).first().click({ force: true });
    }
    await page.waitForTimeout(700);
    const unlockCount = await page.getByText('Unlock Spark', { exact: true }).count();
    const leaveCount = await page.getByText('Leave Spark', { exact: true }).count();
    const leavePulse = await page.getByText('Leave Pulse?').count();
    console.log({ unlockCount, leaveCount, leavePulse });
    await shot(page, 'leave_spark_confirm.png');

    if (leaveCount) {
      await page.getByText('Leave Spark', { exact: true }).first().click({ force: true });
      await page.waitForTimeout(900);
    }

    const policy = page.getByText(/I understand — leave Spark/i);
    if (await policy.count()) {
      console.log('policy_cta', await policy.first().innerText());
      await policy.first().click({ force: true });
      await page.waitForTimeout(900);
    }

    await shot(page, 'spark_discover_after_leave.png');
    const after = await page.locator('body').innerText();
    console.log('after_unlock_spark', /Unlock Spark/i.test(after));
    console.log('after_discover', /Discover|miles|Like/i.test(after));

    await browser.close();
    console.log('ok');
  } catch (err) {
    await shot(page, 'leave_spark_news_failure.png').catch(() => {});
    await browser.close().catch(() => {});
    throw err;
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
