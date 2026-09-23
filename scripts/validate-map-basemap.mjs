#!/usr/bin/env node
/** Ensures map raster tiles load as PNG (not HTML / API-key error pages). */
const url = 'https://a.tile.openstreetmap.fr/osmfr/10/301/385.png';
const res = await fetch(url, { headers: { Accept: 'image/png,image/*' } });
const body = Buffer.from(await res.arrayBuffer());

if (!res.ok) {
  console.error(`Map tile HTTP ${res.status} for ${url}`);
  process.exit(1);
}
if (body.length < 500) {
  console.error(`Map tile too small (${body.length} bytes) for ${url}`);
  process.exit(1);
}
const sniff = body.subarray(0, 8).toString('hex');
if (!sniff.startsWith('89504e47')) {
  console.error(`Map tile is not PNG for ${url}`);
  process.exit(1);
}
const latin = body.toString('latin1');
if (/api\s*key|required/i.test(latin)) {
  console.error(`Map tile appears to be an error image (API key message) for ${url}`);
  process.exit(1);
}

console.log(`validate-map-basemap: OK ${url} (${body.length} bytes)`);
