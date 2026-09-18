import { photosForPexelsId } from './demoPhotoSets';

/** Stable order — one unique Pexels portrait per legacy demo profile (ids 1–88). */
export const LEGACY_PROFILE_IDS = [
  '1', '2', '3', '4', '5', '6', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',
  '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
  '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '66', '67', '68',
  '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83',
  '84', '85', '86', '87', '88',
] as const;

/** Verified Pexels portrait ids — each maps to one human-looking identity via pSet(). */
const LEGACY_PEXELS_IDS: readonly number[] = [
  3760857, 3771835, 3781544, 3791137, 3804757, 3824779, 3842778, 3866325, 3896329, 3917832,
  3924811, 3938475, 3958236, 3977115, 3995112, 4006620, 4017736, 4028460, 4048924, 2373775,
  2379050, 2382861, 2364613, 2364727, 2319676, 2318122, 2292838, 2235389, 2173424, 2141046,
  2036659, 1999751, 1961753, 1922659, 1841142, 1798711, 1755074, 1710231, 1517407, 1133418,
  1074705, 965918, 973406, 980732, 987896, 1001622, 1008264, 1021146, 2618560, 2644688,
  2653862, 2660478, 2670342, 2697890, 2707034, 2716321, 2734789, 2744012, 2771711, 2780944,
  2799410, 2817876, 2827109, 2845575, 1239291, 1264210, 1288171, 1300408, 1327673, 1362537,
  1382739, 1416720, 1438081, 1456700, 1462637, 1475246, 1484797, 1496270, 1509637, 1536619,
  1544727, 1583899, 1594741,
];

const legacyPhotoByProfileId = new Map<string, string[]>(
  LEGACY_PROFILE_IDS.map((profileId, index) => [
    profileId,
    photosForPexelsId(LEGACY_PEXELS_IDS[index] ?? LEGACY_PEXELS_IDS[0]),
  ]),
);

/** Same-person photo array for legacy mock profiles (ids 1–88). */
export function photosForLegacyProfile(profileId: string): string[] | undefined {
  return legacyPhotoByProfileId.get(profileId);
}
