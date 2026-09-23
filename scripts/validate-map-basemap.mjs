#!/usr/bin/env node
/**
 * Ensures map raster tiles load as real PNG map imagery (not HTML, 403 placeholders, or
 * provider "API key required" watermark tiles).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tilesSource = fs.readFileSync(
  path.join(__dirname, '../src/utils/searchMapTiles.ts'),
  'utf8',
);

for (const forbidden of ['cartocdn.com', 'openstreetmap.fr/osmfr', 'maptiler.com']) {
  if (tilesSource.includes(forbidden)) {
    console.error(`validate-map-basemap: forbidden basemap host in searchMapTiles.ts: ${forbidden}`);
    process.exit(1);
  }
}

const UA = 'SparkDatingDemo/1.0 (https://github.com/MonMonMars/New-APP01; map QA)';

/** Tokyo + NYC — regions where watermark tiles were reported. */
const sampleUrls = [
  'https://a.tile.openstreetmap.org/10/901/403.png',
  'https://b.tile.openstreetmap.org/10/301/385.png',
];

for (const url of sampleUrls) {
  const res = await fetch(url, {
    headers: { Accept: 'image/png,image/*', 'User-Agent': UA },
  });
  const body = Buffer.from(await res.arrayBuffer());

  if (!res.ok) {
    console.error(`Map tile HTTP ${res.status} for ${url}`);
    process.exit(1);
  }
  if (body.length < 12_000) {
    console.error(
      `Map tile too small (${body.length} bytes) — likely 403/blocked placeholder for ${url}`,
    );
    process.exit(1);
  }
  const sniff = body.subarray(0, 8).toString('hex');
  if (!sniff.startsWith('89504e47')) {
    console.error(`Map tile is not PNG for ${url}`);
    process.exit(1);
  }
  const latin = body.toString('latin1');
  if (/api\s*key|required|carto\.com\/basemaps|access blocked|403 forbidden/i.test(latin)) {
    console.error(`Map tile appears to be an error/watermark image for ${url}`);
    process.exit(1);
  }
  console.log(`validate-map-basemap: OK ${url} (${body.length} bytes)`);
}
