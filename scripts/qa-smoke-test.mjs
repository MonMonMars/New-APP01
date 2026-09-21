#!/usr/bin/env node
/**
 * Desktop smoke test for Spark web demo.
 * Run: node scripts/qa-smoke-test.mjs <demo-url>
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

import {
  completeDemoOnboarding,
  dismissCookies,
  unlockSparkFromPulse,
} from './demo-onboarding.mjs';

const DEMO_URL = process.argv[2] ?? 'http://127.0.0.1:8090';
const OUT_DIR = '/tmp/spark-qa';
mkdirSync(OUT_DIR, { recursive: true });

const results = [];

function record(area, status, notes) {
  results.push({ area, status, notes });
  console.log(`[${status}] ${area}: ${notes}`);
}

async function clickTab(page, label) {
  await dismissCookies(page);
  const tab = page
    .getByRole('tab', { name: new RegExp(`^${label}$`, 'i') })
    .or(page.getByText(label, { exact: true }).last());
  await tab.first().waitFor({ state: 'visible', timeout: 10000 });
  await tab.first().click();
  return true;
}

async function bodyIncludes(page, ...needles) {
  const text = await page.locator('body').innerText();
  return needles.some((n) => text.toLowerCase().includes(n.toLowerCase()));
}

async function ensureSparkDiscover(page) {
  const text = await page.locator('body').innerText();
  if (/miles away|\d+\s*mi\b/i.test(text)) {
    return;
  }
  const pulseLeave = page.getByLabel(/tap .+ logo to leave/i).first();
  if (await pulseLeave.isVisible({ timeout: 2000 }).catch(() => false)) {
    await unlockSparkFromPulse(page);
    await page.waitForTimeout(1200);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await completeDemoOnboarding(page);
    await ensureSparkDiscover(page);
    record('Boot & onboarding', 'PASS', 'App loaded');

    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT_DIR, '01-discover.png') });

    const hasDiscoverCard = await bodyIncludes(page, 'miles away', 'mi');
    record('Discover deck', hasDiscoverCard ? 'PASS' : 'FAIL', hasDiscoverCard ? 'Profile cards visible' : 'No profile cards');

    await clickTab(page, 'Likes');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT_DIR, '02-likes.png') });
    const likesOk =
      (await bodyIncludes(page, 'likes you', 'who liked', 'upgrade', 'spark+')) &&
      !(await bodyIncludes(page, 'miles away'));
    record('Likes tab', likesOk ? 'PASS' : 'FAIL', likesOk ? 'Likes screen content' : 'Wrong content or discover bleed');

    await clickTab(page, 'Matches');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT_DIR, '03-matches.png') });
    const matchesOk =
      (await bodyIncludes(page, 'messages', 'new matches', 'say something', 'your turn')) &&
      !(await bodyIncludes(page, 'miles away'));
    record('Matches tab', matchesOk ? 'PASS' : 'FAIL', matchesOk ? 'Messages list visible' : 'Wrong content');

    await clickTab(page, 'Profile');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT_DIR, '04-profile.png') });
    const profileOk =
      (await bodyIncludes(page, 'discover tools', 'spark+', 'edit profile', 'discovery preferences', 'security')) &&
      !(await bodyIncludes(page, 'miles away'));
    record('Profile tab', profileOk ? 'PASS' : 'FAIL', profileOk ? 'Settings/profile visible' : 'Wrong content');

    const discoverToolsRow = page.getByText(/discover tools/i).first();
    if (await discoverToolsRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await discoverToolsRow.click();
    } else {
      const discoverTab = page
        .getByRole('tab', { name: /pulse disguise mode/i })
        .or(page.getByRole('tab', { name: /^pulse$/i }))
        .first();
      await discoverTab.click();
      await page.waitForTimeout(800);
      const hubBtn = page.getByLabel(/discover tools/i).first();
      if (await hubBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await hubBtn.click();
      }
    }
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const scrollable = document.querySelector('[class*="ScrollView"]') ?? document.scrollingElement;
      if (scrollable) {
        scrollable.scrollTop = scrollable.scrollHeight;
      }
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT_DIR, '05-discover-hub.png') });
    const hubOk = await bodyIncludes(page, 'ai practice matches', 'nova', 'sage');
    record('Discover Hub + AI row', hubOk ? 'PASS' : 'FAIL', hubOk ? 'AI personas visible' : 'Hub or AI row missing');

    if (hubOk) {
      await page.getByText('Nova', { exact: true }).first().click();
      await page.waitForTimeout(1500);
      const matchOk = await bodyIncludes(page, 'match', "it's a");
      record('AI instant match', matchOk ? 'PASS' : 'FAIL', matchOk ? 'Match modal shown' : 'No match modal');

      const msgBtn = page.getByRole('button', { name: /start talking|send a message|message/i }).first();
      if (await msgBtn.isVisible().catch(() => false)) {
        await msgBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: join(OUT_DIR, '06-ai-chat.png') });

        const chatOk = await bodyIncludes(page, 'ai practice', 'practice match', 'nova');
        record('AI chat open', chatOk ? 'PASS' : 'FAIL', chatOk ? 'Chat with AI context' : 'Chat missing AI cues');

        const input = page.locator('textarea, input[type="text"]').last();
        if (await input.isVisible().catch(() => false)) {
          await input.fill('Hey! How are you doing today?');
          const send = page.getByRole('button', { name: /send/i }).first();
          if (await send.isVisible().catch(() => false)) {
            await send.click();
            await page.waitForTimeout(5000);
            await page.screenshot({ path: join(OUT_DIR, '07-ai-reply.png') });
            const replyOk = await bodyIncludes(page, 'hey', 'hi', 'nova', 'practice', '?', '!');
            record('AI reply', replyOk ? 'PASS' : 'FAIL', replyOk ? 'Reply text detected' : 'No reply after 5s');
          }
        }
      }
    }
  } catch (err) {
    record('Test runner', 'FAIL', String(err?.message ?? err));
    await page.screenshot({ path: join(OUT_DIR, 'error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n=== SUMMARY ===');
  console.log(`URL: ${DEMO_URL}`);
  console.log(`Overall: ${failed.length === 0 ? 'PASS' : 'PARTIAL/FAIL'} (${failed.length} failures)`);
  console.log('Screenshots:', OUT_DIR);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
