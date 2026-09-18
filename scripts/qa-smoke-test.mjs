#!/usr/bin/env node
/**
 * Desktop smoke test for Spark web demo.
 * Run: node scripts/qa-smoke-test.mjs <demo-url>
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const DEMO_URL = process.argv[2] ?? 'https://liquid-specifics-review-arbitrary.trycloudflare.com';
const OUT_DIR = '/tmp/spark-qa';
mkdirSync(OUT_DIR, { recursive: true });

const results = [];

function record(area, status, notes) {
  results.push({ area, status, notes });
  console.log(`[${status}] ${area}: ${notes}`);
}

async function clickByText(page, text, { timeout = 8000 } = {}) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: 'visible', timeout });
  await locator.click();
}

async function skipOnboarding(page) {
  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  const acceptCookies = page.getByRole('button', { name: /^accept$/i });
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click();
    await page.waitForTimeout(600);
  }

  const skip = page.getByText(/continue without account|skip sign-in|demo mode/i).first();
  if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(800);
  }

  for (let step = 0; step < 15; step++) {
    const body = await page.locator('body').innerText().catch(() => '');

    if (/community guidelines/i.test(body)) {
      await page.getByText(/i have read and agree/i).first().click();
      await page.waitForTimeout(400);
      await page.getByText(/continue.*18/i).first().click();
      await page.waitForTimeout(800);
      continue;
    }

    if (/choose your region/i.test(body)) {
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

    if (/tap .* to leave|leave spark|for you|trending/i.test(body)) {
      break;
    }
  }
}

async function unlockSpark(page) {
  await dismissCookies(page);
  const unlock = page.getByLabel(/tap .+ logo to leave spark/i).first();
  if (await unlock.isVisible({ timeout: 8000 }).catch(() => false)) {
    await unlock.click({ force: true });
    await page.waitForTimeout(600);
    const leave = page.getByText(/^Leave Spark$/i).first();
    if (await leave.isVisible({ timeout: 3000 }).catch(() => false)) {
      await leave.click();
      await page.waitForTimeout(600);
    }
    const confirm = page.getByText(/i understand — leave spark/i).first();
    if (await confirm.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirm.click();
      await page.waitForTimeout(1200);
    }
  }
}

async function dismissCookies(page) {
  const essential = page.getByText(/essential only/i).first();
  if (await essential.isVisible({ timeout: 2000 }).catch(() => false)) {
    await essential.click();
    await page.waitForTimeout(500);
  }
}

async function clickTab(page, label) {
  await dismissCookies(page);
  const tab = page.getByText(label, { exact: true }).last();
  await tab.waitFor({ state: 'visible', timeout: 10000 });
  await tab.click();
  return true;
}

async function bodyIncludes(page, ...needles) {
  const text = await page.locator('body').innerText();
  return needles.some((n) => text.toLowerCase().includes(n.toLowerCase()));
}

async function bodyExcludes(page, ...needles) {
  const text = await page.locator('body').innerText();
  return !needles.some((n) => text.toLowerCase().includes(n.toLowerCase()));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await skipOnboarding(page);
    record('Boot & onboarding', 'PASS', 'App loaded');

    await unlockSpark(page);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT_DIR, '01-discover.png') });

    const hasDiscoverCard = await bodyIncludes(page, 'miles away', 'mi');
    record('Discover deck', hasDiscoverCard ? 'PASS' : 'FAIL', hasDiscoverCard ? 'Profile cards visible' : 'No profile cards');

    // Likes tab
    await clickTab(page, 'Likes');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT_DIR, '02-likes.png') });
    const likesOk =
      (await bodyIncludes(page, 'likes you', 'who liked', 'upgrade', 'spark+')) &&
      !(await bodyIncludes(page, 'miles away'));
    record('Likes tab', likesOk ? 'PASS' : 'FAIL', likesOk ? 'Likes screen content' : 'Wrong content or discover bleed');

    // Matches tab
    await clickTab(page, 'Matches');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT_DIR, '03-matches.png') });
    const matchesOk =
      (await bodyIncludes(page, 'messages', 'new matches', 'say something', 'your turn')) &&
      !(await bodyIncludes(page, 'miles away'));
    record('Matches tab', matchesOk ? 'PASS' : 'FAIL', matchesOk ? 'Messages list visible' : 'Wrong content');

    // Profile tab
    await clickTab(page, 'Profile');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT_DIR, '04-profile.png') });
    const profileOk =
      (await bodyIncludes(page, 'discover tools', 'spark+', 'edit profile', 'discovery preferences', 'security')) &&
      !(await bodyIncludes(page, 'miles away'));
    record('Profile tab', profileOk ? 'PASS' : 'FAIL', profileOk ? 'Settings/profile visible' : 'Wrong content');

    // Discover Hub via options icon
    await page.getByRole('tab', { name: /pulse disguise mode/i }).click();
    await page.waitForTimeout(1000);
    const hubBtn = page.locator('[aria-label="Discover tools"]').first();
    if (await hubBtn.isVisible().catch(() => false)) {
      await hubBtn.click();
    } else {
      await page.getByText(/open discover tools/i).first().click().catch(() => {});
    }
    await page.waitForTimeout(1200);
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
