#!/usr/bin/env node
import { chromium } from 'playwright';

import { completeDemoOnboarding, dismissCookies, enterPulseForYouFeed } from './demo-onboarding.mjs';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/check-pulse-features.mjs <url>');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await completeDemoOnboarding(page);
await dismissCookies(page);
await enterPulseForYouFeed(page);
await page.waitForTimeout(1200);

const avatarHosts = await page.evaluate(() =>
  [...document.querySelectorAll('img')]
    .filter((img) => img.clientWidth >= 36 && img.clientWidth <= 56)
    .map((img) => {
      try {
        return new URL(img.currentSrc || img.src).hostname;
      } catch {
        return '';
      }
    })
    .filter(Boolean),
);

const body = await page.locator('body').innerText();
const hasExplicitReporterLink = await page
  .getByLabel(/^View photos from /i)
  .first()
  .isVisible()
  .catch(() => false);
const checks = {
  /** Woven reporters show profile intro captions (syncReporterPhotos), not raw wire quotes. */
  reporterPersonaText:
    /capex|cloud numbers|finally a bus|repair scores|Editorial assistant|Outdoor guide|museums on rainy|personality trait/i.test(
      body,
    ),
  explicitReporterLink: hasExplicitReporterLink,
  noProfileLabel: !/\bPROFILE\b/.test(body),
  /** Woven persona avatars should come from Pexels, not stock Unsplash thumbs. */
  personaAvatarsUsePexels:
    avatarHosts.length > 0 &&
    avatarHosts.every((host) => host === 'images.pexels.com') &&
    !avatarHosts.some((host) => host.includes('unsplash')),
  bundleNew: true,
};

const html = await page.content();
const jsMatch = html.match(/index-([a-f0-9]+)\.js/);
checks.bundleHash = jsMatch?.[1] ?? 'unknown';

console.log(JSON.stringify({ url, checks, sample: body.slice(0, 800) }, null, 2));
await browser.close();
process.exit(
  checks.reporterPersonaText && checks.explicitReporterLink && checks.personaAvatarsUsePexels ? 0 : 1,
);
