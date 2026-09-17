import { chromium } from 'playwright';

const BASE = process.env.DEMO_URL || 'http://localhost:8090';

const clickText = async (page, text, timeout = 8000) => {
  const loc = page.getByText(text, { exact: true }).first();
  await loc.waitFor({ timeout });
  await loc.scrollIntoViewIfNeeded();
  await loc.click({ force: true });
};

async function onboard(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  if (!(await page.getByText('Continue without account').count())) {
    return;
  }
  await clickText(page, 'Continue without account');
  await page.waitForTimeout(300);
  await clickText(page, 'I have read and agree to the policies above');
  await clickText(page, 'Continue — I am 18+');
  await clickText(page, 'Use my location');
  await clickText(page, 'Continue');
  await clickText(page, 'Continue');
  await page.getByText(/^Open /).first().click({ force: true });
  await page.waitForTimeout(900);
  const cookie = page.getByText('Accept', { exact: true });
  if (await cookie.count()) {
    await cookie.click({ force: true }).catch(() => {});
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(12000);

  try {
    await onboard(page);
    const body = await page.locator('body').innerText();
    const checks = {
      female_zodiac_feed: /Virgo|Tarot|星座|Cosmos|Entertainment/i.test(body),
      no_duplicate_pulse_wordmark: !(await page.getByText('Pulse', { exact: true }).count()),
      cosmos_tab: (await page.getByText('Cosmos', { exact: true }).count()) > 0,
      header_leave_btn: (await page.getByRole('button', { name: /Tap Pulse logo to leave Spark/ }).count()) === 1,
    };

    await page.getByText('Cosmos', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(700);
    const cosmosBody = await page.locator('body').innerText();
    checks.cosmos_screen = /Cosmos & culture|Tonight for you|Tarot|星座/i.test(cosmosBody);
    checks.no_markets_on_female_cosmos = !/Stock market/i.test(cosmosBody);

    await page.getByRole('button', { name: /Tap Pulse logo to leave Spark/ }).click();
    await page.waitForTimeout(500);
    await clickText(page, 'Leave Spark');
    await page.waitForTimeout(800);

    await page.getByRole('tab', { name: 'Likes' }).click({ force: true });
    await page.waitForTimeout(700);
    const likesBody = await page.locator('body').innerText();
    checks.likes_reveal_free = /See who liked you and match back instantly/i.test(likesBody);
    checks.no_paywall_banner = !/Upgrade to Spark\+ to see who they are/i.test(likesBody);

    await page.getByRole('tab', { name: 'Discover' }).click({ force: true });
    await page.waitForTimeout(500);
    await page.getByLabel('Discover tools').click({ force: true });
    await page.getByText('Discover tools', { exact: true }).waitFor({ timeout: 8000 });
    await page.waitForTimeout(400);
    const hubBody = await page.locator('body').innerText();
    const likesMatch = hubBody.match(/(\d+) likes left today/i);
    checks.female_like_quota = likesMatch !== null && Number(likesMatch[1]) >= 25;
    if (!checks.female_like_quota) {
      console.log('hub_likes_line', likesMatch?.[0] ?? 'missing');
    }

    console.log(JSON.stringify(checks, null, 2));
    const failed = Object.entries(checks).filter(([, ok]) => !ok);
    if (failed.length) {
      throw new Error(`Failed checks: ${failed.map(([k]) => k).join(', ')}`);
    }
    console.log('ok');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
