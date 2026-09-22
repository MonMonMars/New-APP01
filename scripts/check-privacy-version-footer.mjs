#!/usr/bin/env node
/**
 * Privacy controls footer must show localized app version, not a raw i18n key.
 */
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies } from './demo-onboarding.mjs';

const DEMO_URL = process.argv[2] ?? 'http://127.0.0.1:8090';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await completeDemoOnboarding(page);
    await dismissCookies(page);

    const profileTab = page.getByRole('tab', { name: /profile/i }).first();
    await profileTab.click({ force: true });
    await page.waitForTimeout(800);

    const privacyRow = page.getByText(/Privacy controls|隱私控制/, { exact: true }).first();
    await privacyRow.click({ force: true });
    await page.waitForTimeout(600);

    const body = await page.locator('body').innerText();
    const badKey = body.includes('privacy.appVersion');
    const hasVersion =
      /App version\s+[\d.]+\s·\s[a-f0-9]+-/i.test(body) ||
      /App 版本\s+[\d.]+\s·\s[a-f0-9]+-/i.test(body);

    const ok = !badKey && hasVersion;
    console.log(JSON.stringify({ ok, badKey, hasVersion }, null, 2));
    if (!ok) {
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

main();
