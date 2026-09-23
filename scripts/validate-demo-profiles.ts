import '../src/data/demoPortraitPools';
import { AI_PERSONA_IDS, INCOMING_LIKE_IDS, mockProfiles, getProfileById } from '../src/data/profiles';

const humanProfiles = mockProfiles.filter((p) => !AI_PERSONA_IDS.has(p.id) && !p.isAiPersona);

const nameCounts = new Map<string, number>();
const invalidPhotoProfiles: string[] = [];

function isPexelsPortraitUrl(url: string): boolean {
  return url.includes('images.pexels.com/photos/');
}

function isLegacyDemoPortraitUri(url: string): boolean {
  return url.toLowerCase().startsWith('spark-demo-portrait://');
}

for (const profile of humanProfiles) {
  const nameKey = profile.name.trim().toLowerCase();
  nameCounts.set(nameKey, (nameCounts.get(nameKey) ?? 0) + 1);

  if (profile.photos.length === 0) {
    invalidPhotoProfiles.push(profile.id);
    continue;
  }

  const bad = profile.photos.some(
    (url) => !isPexelsPortraitUrl(url) || isLegacyDemoPortraitUri(url),
  );
  if (bad) {
    invalidPhotoProfiles.push(profile.id);
  }
}

const duplicateNames = [...nameCounts.entries()].filter(([, count]) => count > 1);
const legacyShortBios = humanProfiles.filter(
  (p) => Number(p.id) < 97 && (p.bio?.length ?? 0) < 80,
);

const missingIncoming = INCOMING_LIKE_IDS.filter((id) => getProfileById(id) === undefined);

function validateBatch(minId: number, maxId: number, label: string): boolean {
  const batch = humanProfiles.filter((p) => {
    const n = Number(p.id);
    return n >= minId && n <= maxId;
  });

  const namesUnique = new Set(batch.map((p) => p.name.toLowerCase())).size === batch.length;

  if (!namesUnique) {
    console.error(`${label} must have unique names`);
    return false;
  }

  return true;
}

const nextBatchOk = validateBatch(117, 136, 'Batch 117–136');
const latestBatchOk = validateBatch(137, 156, 'Batch 137–156');
const newestBatchOk = validateBatch(157, 176, 'Batch 157–176');

console.log(
  JSON.stringify(
    {
      totalHumanProfiles: humanProfiles.length,
      invalidPhotoProfileCount: invalidPhotoProfiles.length,
      duplicateNameCount: duplicateNames.length,
      legacyShortBioCount: legacyShortBios.length,
      missingIncomingIds: missingIncoming,
      nextBatchUnique: nextBatchOk,
      latestBatchUnique: latestBatchOk,
      newestBatchUnique: newestBatchOk,
    },
    null,
    2,
  ),
);

if (missingIncoming.length > 0) {
  console.error('INCOMING_LIKE_IDS reference missing profiles:', missingIncoming);
  process.exit(1);
}

if (invalidPhotoProfiles.length > 0) {
  console.error(
    'Catalog profiles must use Pexels portrait URLs (no AI bundle / unsplash):',
    invalidPhotoProfiles.slice(0, 40),
  );
  process.exit(1);
}

if (legacyShortBios.length > 0) {
  console.error('Legacy profiles still have short bios:', legacyShortBios.map((p) => p.id).join(', '));
  process.exit(1);
}

if (!nextBatchOk || !latestBatchOk || !newestBatchOk) {
  process.exit(1);
}

process.exit(0);
