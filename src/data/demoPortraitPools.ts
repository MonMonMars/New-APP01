import { DEMO_PHOTO_SET_PRIMARY } from './demoPhotoSets';
import { LEGACY_PEXELS_IDS } from './legacyPexelsIds';

/** Passport deck (profiles 201–218) — disjoint from NYC batch + legacy pools. */
export const PASSPORT_PORTRAIT_PRIMARY_IDS: readonly number[] = [
  3398464, 3408744, 3417775, 3389938, 3433333, 3409031, 3455279, 3468371, 3512868, 3483471,
  3493974, 3506189, 3516064, 3525544, 3535077, 3525074, 3558529, 3564325,
] as const;

const batchPrimaryIds = Object.values(DEMO_PHOTO_SET_PRIMARY);

function assertDisjoint(label: string, a: readonly number[], b: readonly number[]): void {
  const setB = new Set(b);
  const overlap = a.filter((id) => setB.has(id));
  if (overlap.length > 0) {
    throw new Error(`${label}: portrait ids overlap demo pool: ${overlap.slice(0, 8).join(', ')}`);
  }
}

assertDisjoint('LEGACY_PEXELS_IDS', LEGACY_PEXELS_IDS, batchPrimaryIds);
assertDisjoint('PASSPORT_PORTRAIT_PRIMARY_IDS', PASSPORT_PORTRAIT_PRIMARY_IDS, batchPrimaryIds);
assertDisjoint('legacy vs passport', LEGACY_PEXELS_IDS, PASSPORT_PORTRAIT_PRIMARY_IDS);

/** Every human demo profile should map to one primary id from exactly one pool. */
export const DEMO_PORTRAIT_PRIMARY_COUNT =
  batchPrimaryIds.length + LEGACY_PEXELS_IDS.length + PASSPORT_PORTRAIT_PRIMARY_IDS.length;
