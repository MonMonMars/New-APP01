/**
 * Fail fast when the demo URL serves a GitHub Pages build on a root static host.
 */
export async function assertRootDemoBundle(demoUrl) {
  const html = await fetch(demoUrl, { redirect: 'follow' }).then((r) => r.text());
  const jsMatch = html.match(/((?:\/[^"\/]+)?\/_expo\/static\/js\/web\/index-[^"]+\.js)/);
  if (!jsMatch) {
    throw new Error('Demo HTML has no Expo web bundle script tag');
  }
  const jsUrl = new URL(jsMatch[1], demoUrl).href;
  const jsRes = await fetch(jsUrl, { redirect: 'follow' });
  if (jsRes.status !== 200) {
    throw new Error(`Demo JS bundle HTTP ${jsRes.status}: ${jsUrl}`);
  }
  const head = (await jsRes.text()).slice(0, 48);
  if (head.trimStart().startsWith('<')) {
    throw new Error(
      'Demo JS URL returned HTML (wrong base path). Run: npm run build:web:demo && serve from repo root with serve.json — do not use build:web:pages for :8090',
    );
  }
  if (jsMatch[1].includes('/New-APP01/')) {
    throw new Error(
      'Demo index.html still references /New-APP01/. Rebuild with npm run build:web:demo (Pages export uses dist-pages/)',
    );
  }
}
