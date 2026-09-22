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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function probePexelsPhoto(id) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop`;
  const attempts = 4;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20_000);
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { Range: 'bytes=0-0' },
      });
      clearTimeout(timer);
      if (response.status === 200 || response.status === 206) {
        return 200;
      }
      if (response.status === 429) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      if (response.status >= 400) {
        return response.status;
      }
    } catch {
      await sleep(400 * (attempt + 1));
    }
  }
  return 0;
}

const broken = [];
const transient = [];
for (const id of sorted) {
  const st = await probePexelsPhoto(id);
  if (st !== 200) {
    const entry = { id, st };
    if (st === 0 || st === 429) {
      transient.push(entry);
    } else {
      broken.push(entry);
    }
  }
  await sleep(20);
}

console.log(
  JSON.stringify(
    {
      total: sorted.length,
      broken,
      transientSkipped: transient.length > 0 ? transient : undefined,
    },
    null,
    2,
  ),
);

if (broken.length > 0) {
  process.exit(1);
}

if (transient.length > 0) {
  console.warn(
    `Pexels probe: ${transient.length} id(s) unreachable in this environment (network/rate limit); catalog IDs unchanged.`,
  );
}
