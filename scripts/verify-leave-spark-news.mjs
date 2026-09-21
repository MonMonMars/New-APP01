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
const OUT = process.env.SCREENSHOT_DIR || '/opt/cursor/artifacts';
mkdirSync(OUT, { recursive: true });

const shot = async (page, name) => {
  const file = join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
  return file;
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
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  page.setDefaultTimeout(15000);

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await completeDemoOnboarding(page);
    await dismissCookies(page);
    await enterPulseForYouFeed(page);

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
    await page
      .getByText('Read on BBC News')
      .first()
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});
    await page.waitForTimeout(400);

    await unlockSparkFromPulse(page);
    await shot(page, 'spark_discover_after_leave.png');
    const after = await page.locator('body').innerText();
    console.log('after_unlock_spark', /Unlock Spark/i.test(after));
    console.log('after_discover', /Discover|miles|Like/i.test(after));

    if (!/Discover|miles|\d+\s*mi\b/i.test(after)) {
      throw new Error('did not land on Spark discover after leave flow');
    }

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
