import { photosForPexelsId } from './demoPhotoSets';
import { LEGACY_PEXELS_IDS } from './legacyPexelsIds';

export { LEGACY_PEXELS_IDS } from './legacyPexelsIds';

/** Stable order — one unique Pexels portrait per legacy demo profile (ids 1–88). */
export const LEGACY_PROFILE_IDS = [
  '1', '2', '3', '4', '5', '6', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',
  '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
  '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '66', '67', '68',
  '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83',
  '84', '85', '86', '87', '88',
] as const;

let legacyPhotoByProfileId: Map<string, string[]> | null = null;

function legacyPhotoMap(): Map<string, string[]> {
  if (!legacyPhotoByProfileId) {
    legacyPhotoByProfileId = new Map(
      LEGACY_PROFILE_IDS.map((profileId, index) => [
        profileId,
        photosForPexelsId(LEGACY_PEXELS_IDS[index] ?? LEGACY_PEXELS_IDS[0]),
      ]),
    );
  }
  return legacyPhotoByProfileId;
}

/** Portrait gallery for legacy mock profiles (ids 1–88). */
export function photosForLegacyProfile(profileId: string): string[] | undefined {
  return legacyPhotoMap().get(profileId);
}
