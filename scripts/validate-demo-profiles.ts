import { AI_PERSONA_IDS, INCOMING_LIKE_IDS, mockProfiles, getProfileById } from '../src/data/profiles';

const humanProfiles = mockProfiles.filter((p) => !AI_PERSONA_IDS.has(p.id) && !p.isAiPersona);

const nameCounts = new Map<string, number>();
const photoCounts = new Map<string, number>();

for (const profile of humanProfiles) {
  const nameKey = profile.name.trim().toLowerCase();
  nameCounts.set(nameKey, (nameCounts.get(nameKey) ?? 0) + 1);
  const primary = profile.photos[0];
  if (primary) {
    photoCounts.set(primary, (photoCounts.get(primary) ?? 0) + 1);
  }
}

const duplicateNames = [...nameCounts.entries()].filter(([, count]) => count > 1);
const duplicatePhotos = [...photoCounts.entries()].filter(([, count]) => count > 1);

const missingIncoming = INCOMING_LIKE_IDS.filter((id) => getProfileById(id) === undefined);

function validateBatch(minId: number, maxId: number, label: string): boolean {
  const batch = humanProfiles.filter((p) => {
    const n = Number(p.id);
    return n >= minId && n <= maxId;
  });

  const namesUnique = new Set(batch.map((p) => p.name.toLowerCase())).size === batch.length;
  const photosUnique = new Set(batch.map((p) => p.photos[0])).size === batch.length;
  const photoNotInLegacy = batch.every(
    (p) => !humanProfiles.some((other) => other.id !== p.id && other.photos[0] === p.photos[0]),
  );

  if (!namesUnique || !photosUnique || !photoNotInLegacy) {
    console.error(`${label} must have unique names and primary photos`);
    return false;
  }

  return true;
}

const nextBatchOk = validateBatch(117, 136, 'Batch 117–136');
const latestBatchOk = validateBatch(137, 156, 'Batch 137–156');

console.log(
  JSON.stringify(
    {
      totalHumanProfiles: humanProfiles.length,
      nextBatchCount: humanProfiles.filter((p) => Number(p.id) >= 117 && Number(p.id) <= 136).length,
      latestBatchCount: humanProfiles.filter((p) => Number(p.id) >= 137 && Number(p.id) <= 156).length,
      duplicateNameCount: duplicateNames.length,
      duplicatePrimaryPhotoCount: duplicatePhotos.length,
      missingIncomingIds: missingIncoming,
      nextBatchUnique: nextBatchOk,
      latestBatchUnique: latestBatchOk,
    },
    null,
    2,
  ),
);

if (missingIncoming.length > 0) {
  console.error('INCOMING_LIKE_IDS reference missing profiles:', missingIncoming);
  process.exit(1);
}

if (!nextBatchOk || !latestBatchOk) {
  process.exit(1);
}

process.exit(0);
