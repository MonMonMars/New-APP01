#!/usr/bin/env node
/**
 * Pre-delivery demo verification — run before sharing any demo URL.
 * Usage: node scripts/verify-demo-link.mjs <demo-url>
 */
import { chromium } from 'playwright';

const DEMO_URL = process.argv[2];
if (!DEMO_URL) {
  console.error('Usage: node scripts/verify-demo-link.mjs <demo-url>');
  process.exit(1);
}

const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`✓ ${name}: ${detail}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`✗ ${name}: ${detail}`);
}

async function httpOk(url) {
  const res = await fetch(url, { redirect: 'follow' });
  return res.status;
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
    if (await page.getByText(/open pulse/i).first().isVisible().catch(() => false)) {
      await page.getByText(/open pulse/i).first().click();
      await page.waitForTimeout(1200);
      return;
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

async function unlockSpark(page) {
  await dismissCookies(page);
  const unlock = page.getByLabel(/tap to unlock spark/i).first();
  await unlock.waitFor({ state: 'visible', timeout: 8000 });
  await unlock.click();
  await page.waitForTimeout(600);

  const policy = page.getByText(/i understand — unlock spark/i).first();
  if (await policy.isVisible({ timeout: 3000 }).catch(() => false)) {
    await policy.click();
    await page.waitForTimeout(1200);
  }
}

async function main() {
  console.log(`\nVerifying demo: ${DEMO_URL}\n`);

  try {
    const pageStatus = await httpOk(DEMO_URL);
    if (pageStatus !== 200) {
      fail('HTTP page', `status ${pageStatus}`);
    } else {
      pass('HTTP page', '200 OK');
    }

    const html = await fetch(DEMO_URL).then((r) => r.text());
    const jsMatch = html.match(/(\/_expo\/static\/js\/web\/index-[^"]+\.js)/);
    if (!jsMatch) {
      fail('JS bundle', 'script tag not found in HTML');
    } else {
      const jsUrl = new URL(jsMatch[1], DEMO_URL).href;
      const jsStatus = await httpOk(jsUrl);
      if (jsStatus !== 200) {
        fail('JS bundle', `status ${jsStatus}`);
      } else {
        pass('JS bundle', '200 OK');
      }
    }
  } catch (err) {
    fail('HTTP', String(err?.message ?? err));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  try {
    const resp = await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (!resp || resp.status() >= 400) {
      fail('Browser load', `HTTP ${resp?.status() ?? 'no response'}`);
    } else {
      pass('Browser load', 'page opened');
    }

    await page.waitForTimeout(1500);
    const landing = await page.locator('body').innerText();
    if (!/continue without account|welcome to pulse/i.test(landing)) {
      fail('Landing screen', 'welcome/sign-in not visible');
    } else {
      pass('Landing screen', 'welcome visible');
    }

    await completeOnboarding(page);
    pass('Onboarding', 'completed');

    const trendingTab = page.getByText(/^trending$/i).first();
    if (await trendingTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await trendingTab.click();
      await page.waitForTimeout(900);
      const trendingText = await page.locator('body').innerText();
      if (/trending.*useful|weather|stock market/i.test(trendingText)) {
        pass('Pulse trending', 'explore screen visible');
      } else {
        fail('Pulse trending', 'explore content not visible');
      }
    } else {
      fail('Pulse trending', 'tab not found');
    }

    await unlockSpark(page);
    await dismissCookies(page);

    const spark = await page.locator('body').innerText();
    if (!/miles away|mi\b/i.test(spark)) {
      fail('Spark discover', 'profile cards not visible after unlock');
    } else {
      pass('Spark discover', 'profile cards visible');
    }

    if (consoleErrors.length) {
      fail('Console', consoleErrors.slice(0, 2).join(' | '));
    } else {
      pass('Console', 'no runtime errors');
    }
  } catch (err) {
    fail('Browser flow', String(err?.message ?? err));
  } finally {
    await browser.close();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n--- Result: ${failed.length === 0 ? 'PASS' : 'FAIL'} (${checks.length - failed.length}/${checks.length} checks) ---\n`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
