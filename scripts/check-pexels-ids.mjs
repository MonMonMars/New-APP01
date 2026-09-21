import { mockProfiles, AI_PERSONA_IDS } from '../src/data/profiles.ts';

const ids = new Set();
for (const p of mockProfiles) {
  if (AI_PERSONA_IDS.has(p.id) || p.isAiPersona) continue;
  for (const url of p.photos) {
    const m = url.match(/photos\/(\d+)\//);
    if (m) ids.add(Number(m[1]));
  }
}
const sorted = [...ids].sort((a, b) => a - b);

async function head(id) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop`;
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return r.status;
  } catch {
    return 0;
  }
}

const broken = [];
for (const id of sorted) {
  const st = await head(id);
  if (st !== 200) broken.push({ id, st });
  await new Promise((r) => setTimeout(r, 25));
}
console.log(JSON.stringify({ total: sorted.length, broken }, null, 2));
if (broken.length > 0) {
  process.exit(1);
}
