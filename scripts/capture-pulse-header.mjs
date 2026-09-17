import { chromium } from 'playwright';

const BASE = process.env.DEMO_URL || 'http://localhost:8090';
const OUT = process.env.SCREENSHOT_DIR || '/opt/cursor/artifacts/screenshots';

const clickText = async (page, text) => {
  await page.getByText(text, { exact: true }).first().click({ force: true });
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  if (await page.getByText('Continue without account').count()) {
    await clickText(page, 'Continue without account');
    await clickText(page, 'I have read and agree to the policies above');
    await clickText(page, 'Continue — I am 18+');
    await clickText(page, 'Use my location');
    await clickText(page, 'Continue');
    await clickText(page, 'Continue');
    await page.getByText(/^Open /).first().click({ force: true });
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: `${OUT}/pulse_header_logo_fixed.png` });
  await browser.close();
  console.log('saved', `${OUT}/pulse_header_logo_fixed.png`);
})();
