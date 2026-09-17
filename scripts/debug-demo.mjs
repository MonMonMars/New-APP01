#!/usr/bin/env node
/**
 * Fast debug runner for Spark web demo — logs each step, captures errors.
 * Usage: node scripts/debug-demo.mjs [url]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const DEMO_URL = process.argv[2] ?? 'http://localhost:8090';
const OUT_DIR = '/tmp/spark-debug';
mkdirSync(OUT_DIR, { recursive: true });

const log = (msg) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
const issues = [];

function issue(area, detail) {
  issues.push({ area, detail });
  log(`ISSUE [${area}] ${detail}`);
}

async function snap(page, name) {
  const path = join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  log(`screenshot: ${path}`);
}

async function bodyText(page) {
  return page.locator('body').innerText().catch(() => '');
}

async function dismissCookies(page) {
  const btn = page.getByText(/essential only/i).first();
  if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(400);
  }
}

async function main() {
  log(`Starting debug on ${DEMO_URL}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const consoleErrors = [];
  const networkFails = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  page.on('requestfailed', (req) => {
    networkFails.push(`${req.url()} — ${req.failure()?.errorText}`);
  });

  try {
    log('Navigating...');
    const resp = await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    log(`HTTP ${resp?.status() ?? 'no response'}`);
    if (!resp || resp.status() >= 400) issue('boot', `HTTP ${resp?.status()}`);

    await page.waitForTimeout(2500);
    await snap(page, '00-landing');

    const landing = await bodyText(page);
    if (!landing.trim()) issue('boot', 'Blank page body');
    else log(`Landing text: ${landing.slice(0, 120).replace(/\s+/g, ' ')}`);

    const accept = page.getByRole('button', { name: /^accept$/i });
    if (await accept.isVisible({ timeout: 2000 }).catch(() => false)) {
      await accept.click();
      log('Accepted cookies');
      await page.waitForTimeout(500);
    }

    const skip = page.getByText(/continue without account|skip sign-in|demo mode/i).first();
    if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) {
      await skip.click();
      log('Skipped sign-in');
      await page.waitForTimeout(1000);
    } else {
      issue('onboarding', 'Skip sign-in button not found');
    }

    for (let step = 0; step < 15; step++) {
      const text = await bodyText(page);
      log(`Onboarding step ${step}: ${text.slice(0, 80).replace(/\s+/g, ' ')}`);

      if (/community guidelines/i.test(text)) {
        await page.getByText(/i have read and agree/i).first().click();
        await page.waitForTimeout(400);
        await page.getByText(/continue.*18/i).first().click();
        await page.waitForTimeout(800);
        continue;
      }

      if (/choose your region/i.test(text)) {
        await page.getByText(/use my location/i).first().click();
        await page.waitForTimeout(800);
        continue;
      }

      const openPulse = page.getByText(/open pulse/i).first();
      if (await openPulse.isVisible().catch(() => false)) {
        await openPulse.click();
        await page.waitForTimeout(1200);
        break;
      }

      const cont = page.getByText(/^continue$/i).first();
      if (await cont.isVisible().catch(() => false)) {
        await cont.click();
        await page.waitForTimeout(800);
        continue;
      }

      if (/tap .* to leave|leave spark|trending|for you/i.test(text)) break;
    }

    await snap(page, '01-after-onboarding');

    await dismissCookies(page);
    const unlock = page.getByLabel(/tap .+ logo to leave spark/i).first();
    if (await unlock.isVisible({ timeout: 4000 }).catch(() => false)) {
      await unlock.click();
      await page.waitForTimeout(600);
      const leave = page.getByText(/^Leave Spark$/i).first();
      if (await leave.isVisible().catch(() => false)) {
        await leave.click();
        await page.waitForTimeout(600);
      }
      const policy = page.getByText(/i understand — leave spark/i).first();
      if (await policy.isVisible().catch(() => false)) {
        await policy.click();
        await page.waitForTimeout(1200);
      }
      log('Unlocked Spark');
    }

    await snap(page, '02-spark-discover');
    const discoverText = await bodyText(page);
    const hasCards = /miles away|mi\b|like|pass/i.test(discoverText);
    if (!hasCards) issue('discover', 'No profile cards visible after unlock');
    else log('Discover cards OK');

    // Tab bleed check — discover deck must not overlay other tabs
    const tabs = ['Likes', 'Matches', 'Profile'];
    for (const tab of tabs) {
      await page.getByRole('tab', { name: new RegExp(tab, 'i') }).click({ timeout: 8000 });
      await page.waitForTimeout(1200);
      const passBtn = page.getByRole('button', { name: /^pass$/i }).first();
      const bleed = await passBtn.isVisible().catch(() => false);
      if (bleed) issue('tab-bleed', `${tab} tab shows discover pass button (deck bleed)`);
      else log(`${tab} tab OK`);
      await snap(page, `03-tab-${tab.toLowerCase()}`);
    }

    // Profile views card (scroll — card sits below hero)
    await page.getByRole('tab', { name: /profile/i }).click();
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    const profileText = await bodyText(page);
    if (/who viewed you/i.test(profileText)) log('Profile views card OK');
    else issue('phase-d', 'Who viewed you card not visible on Profile');

    // Discover rewind
    await page.getByRole('tab', { name: /discover/i }).click();
    await page.waitForTimeout(1000);

    // Pass a card if possible
    const passZone = page.getByRole('button', { name: /^pass$/i }).first();
    if (await passZone.isVisible().catch(() => false)) {
      await passZone.click();
      await page.waitForTimeout(1000);
      log('Passed a card');
    } else {
      issue('discover', 'Pass button not found on Discover');
    }

    const rewind = page.getByText(/rewind/i).first();
    if (await rewind.isVisible({ timeout: 3000 }).catch(() => false)) {
      log('Rewind button visible after pass');
    } else {
      issue('phase-d', 'Rewind button not visible after pass');
    }
    await snap(page, '04-discover-rewind');

    // AI match + chat
    const hub = page.locator('[aria-label="Discover tools"]').first();
    if (await hub.isVisible().catch(() => false)) {
      await hub.click();
      await page.waitForTimeout(1000);
      const nova = page.getByText('Nova', { exact: true }).first();
      if (await nova.isVisible().catch(() => false)) {
        await nova.click();
        await page.waitForTimeout(1500);
        const msgBtn = page.getByRole('button', { name: /start talking|send a message|message/i }).first();
        if (await msgBtn.isVisible().catch(() => false)) {
          await msgBtn.click();
          await page.waitForTimeout(1500);
          await snap(page, '05-chat');

          const chatText = await bodyText(page);
          if (/active now/i.test(chatText)) log('Active now badge OK');
          if (/ai practice/i.test(chatText)) log('AI chat banner OK');

          const extrasBtn = page.getByRole('button', { name: /more actions/i }).first();
          if (await extrasBtn.isVisible().catch(() => false)) {
            await extrasBtn.click();
            await page.waitForTimeout(500);
            const gif = page.getByText('GIF', { exact: true }).first();
            if (await gif.isVisible().catch(() => false)) log('GIF picker entry OK');
            else issue('phase-d', 'GIF option not in chat composer extras');
          } else {
            log('Chat extras button not found (skipped)');
          }
        }
      }
    }

    if (consoleErrors.length) {
      issue('console', consoleErrors.slice(0, 5).join(' | '));
    }
    const criticalNetworkFails = networkFails.filter(
      (entry) => !/ERR_BLOCKED_BY_ORB|images\.unsplash\.com/i.test(entry),
    );
    if (criticalNetworkFails.length) {
      issue('network', criticalNetworkFails.slice(0, 5).join(' | '));
    } else if (networkFails.length) {
      log(`Network: ${networkFails.length} non-critical ORB/image warnings (unsplash)`);
    }

    writeFileSync(join(OUT_DIR, 'report.json'), JSON.stringify({ url: DEMO_URL, issues, consoleErrors, networkFails }, null, 2));
  } catch (err) {
    issue('runner', String(err?.message ?? err));
    await snap(page, 'error').catch(() => {});
  } finally {
    await browser.close();
  }

  log('\n=== DEBUG REPORT ===');
  log(`URL: ${DEMO_URL}`);
  log(`Issues: ${issues.length}`);
  for (const i of issues) log(`  - [${i.area}] ${i.detail}`);
  log(`Screenshots: ${OUT_DIR}`);
  process.exit(issues.length > 0 ? 1 : 0);
}

main();
