#!/usr/bin/env node
/**
 * Spark/Ember dating mode — grey P-only tab entry + Spark/Ember logo top-left.
 * Usage: node scripts/verify-spark-ember-pulse-buttons.mjs [baseUrl]
 */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies } from './demo-onboarding.mjs';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:8090';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const checks = {};

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await dismissCookies(page);
    await completeDemoOnboarding(page);
    await dismissCookies(page);
    await page.waitForTimeout(800);

    checks.no_top_pulse_entry =
      (await page.getByLabel(/Emergency — switch to .* disguise mode/i).count()) === 0;

    const pulseTab = page.getByRole('tab', { name: /pulse disguise mode/i });
    checks.pulse_tab_a11y = (await pulseTab.count()) === 1;
    checks.pulse_tab_label =
      (await page.getByRole('tab', { name: /^pulse$/i }).count()) >= 1 ||
      (await page.getByRole('tab', { name: /pulse disguise mode/i }).count()) >= 1;

    checks.discover_spark_logo =
      (await page.getByRole('button', { name: /Spark\./i }).count()) >= 1 ||
      (await page.getByRole('img', { name: 'Spark' }).count()) >= 1;

    await page.getByRole('tab', { name: /likes/i }).click({ force: true });
    await page.waitForTimeout(600);
    checks.likes_no_top_pulse =
      (await page.getByLabel(/Emergency — switch to .* disguise mode/i).count()) === 0;
    checks.likes_spark_logo = (await page.getByRole('img', { name: 'Spark' }).count()) >= 1;

    await pulseTab.click({ force: true });
    await page.waitForTimeout(600);
    await pulseTab.click({ force: true });
    await page.waitForTimeout(900);
    checks.tab_enters_disguise =
      (await page.getByText('Leave Pulse?').count()) > 0 ||
      (await page.getByText(/Top stories|Cosmos/i).count()) > 0;
    checks.leave_pulse_button =
      (await page.getByRole('button', { name: /^Leave Pulse$/i }).count()) > 0;

    console.log(JSON.stringify({ ok: Object.values(checks).every(Boolean), checks }, null, 2));
    if (!Object.values(checks).every(Boolean)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
