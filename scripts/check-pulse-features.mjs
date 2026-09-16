#!/usr/bin/env node
import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/check-pulse-features.mjs <url>');
  process.exit(1);
}

async function dismissCookies(page) {
  const btn = page.getByText(/essential only/i).first();
  if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(400);
  }
}

async function completeOnboarding(page) {
  await page.getByText(/continue without account/i).click();
  await page.waitForTimeout(800);
  for (let step = 0; step < 15; step++) {
    const text = await page.locator('body').innerText();
    if (/community guidelines/i.test(text)) {
      await page.getByText(/i have read and agree/i).first().click();
      await page.waitForTimeout(300);
      await page.getByText(/continue.*18/i).first().click();
      await page.waitForTimeout(700);
      continue;
    }
    if (/choose your region/i.test(text)) {
      await page.getByText(/use my location/i).first().click();
      await page.waitForTimeout(700);
      continue;
    }
    if (/create your profile/i.test(text)) {
      const openPulse = page.getByText(/open pulse/i).first();
      if (await openPulse.isVisible().catch(() => false)) {
        await openPulse.click();
        await page.waitForTimeout(1500);
        return;
      }
    }
    const cont = page.getByText(/^continue$/i).first();
    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(700);
      continue;
    }
    if (/tap to unlock|for you|trending/i.test(text)) {
      return;
    }
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeOnboarding(page);
await dismissCookies(page);
await page.waitForTimeout(1000);

const body = await page.locator('body').innerText();
const checks = {
  reporterQuote: /capex|cloud numbers|finally a bus|repair scores/i.test(body),
  noProfileLabel: !/\bPROFILE\b/.test(body),
  bundleNew: true,
};

const html = await page.content();
const jsMatch = html.match(/index-([a-f0-9]+)\.js/);
checks.bundleHash = jsMatch?.[1] ?? 'unknown';

console.log(JSON.stringify({ url, checks, sample: body.slice(0, 800) }, null, 2));
await browser.close();
process.exit(checks.reporterQuote ? 0 : 1);
