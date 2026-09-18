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

const nextBatch = humanProfiles.filter((p) => {
  const n = Number(p.id);
  return n >= 117 && n <= 136;
});

const nextNamesUnique = new Set(nextBatch.map((p) => p.name.toLowerCase())).size === nextBatch.length;
const nextPhotosUnique = new Set(nextBatch.map((p) => p.photos[0])).size === nextBatch.length;
const nextPhotoNotInLegacy = nextBatch.every(
  (p) => !humanProfiles.some((other) => other.id !== p.id && other.photos[0] === p.photos[0]),
);

console.log(
  JSON.stringify(
    {
      totalHumanProfiles: humanProfiles.length,
      nextBatchCount: nextBatch.length,
      duplicateNameCount: duplicateNames.length,
      duplicatePrimaryPhotoCount: duplicatePhotos.length,
      missingIncomingIds: missingIncoming,
      nextBatchUnique: nextNamesUnique && nextPhotosUnique && nextPhotoNotInLegacy,
    },
    null,
    2,
  ),
);

if (missingIncoming.length > 0) {
  console.error('INCOMING_LIKE_IDS reference missing profiles:', missingIncoming);
  process.exit(1);
}

if (!nextNamesUnique || !nextPhotosUnique || !nextPhotoNotInLegacy) {
  console.error('Batch 117–136 must have unique names and primary photos');
  process.exit(1);
}

process.exit(0);
