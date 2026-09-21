/** Curated portrait sets — three distinct face-forward photos per demo identity. */

import { LEGACY_PEXELS_IDS } from './legacyPexelsIds';

const p = (id: number, w = 800, h = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

/** Pexels ids that 404 or are not reliable portrait sources. */
export const INVALID_PEXELS_IDS = new Set<number>([
  1771024, 2699703, 2723894, 2752802, 2760245, 2800895, 2859040, 2906829, 2938299, 2948298,
  3028298, 3038298, 3048298, 3068298, 3078298, 3088298, 3098298, 3108298, 3168298, 3188298,
  3208298, 3218298, 3248298, 3258298, 3268298, 3288298,
  /** Removed from Pexels CDN — caused blank profile heroes. */
  2064340, 2103808, 2148535, 2194794, 2212476, 2256940, 2471178, 2480592, 2500450, 2523941,
  2539781, 2558604, 2570591, 3423564, 3443584, 3465021, 3474219, 3544825, 3554575,
]);

function hashNumber(value: number): number {
  let hash = value | 0;
  hash = (hash ^ (hash >>> 16)) * 0x7feb352d;
  hash = (hash ^ (hash >>> 15)) * 0x846ca68b;
  return Math.abs(hash ^ (hash >>> 16));
}

const CROP_SLOTS: Array<[number, number]> = [
  [800, 1000],
  [720, 960],
  [640, 800],
];

function portraitCrop(id: number, slot: 0 | 1 | 2): string {
  const [w, h] = CROP_SLOTS[slot];
  return p(id, w, h);
}

/** Primary Pexels portrait id per named demo photo set (profiles 97–176). */
export const DEMO_PHOTO_SET_PRIMARY = {
  maya: 1605277,
  elena: 1626464,
  nia: 1646863,
  hannah: 1680215,
  jade: 1733346,
  vera: 1181686,
  clara: 1587009,
  iris: 1858175,
  stephanie: 1926769,
  mathilde: 2062362,
  lucas: 1743394,
  daniel: 1755383,
  marco: 1765588,
  nathan: 1681010,
  phoenix: 614810,
  simon: 1516680,
  miguel: 1043471,
  anthony: 91227,
  oliver: 220453,
  morris: 1689710,
  amara: 774909,
  sloane: 1130626,
  camille: 415829,
  luna: 1181519,
  tessa: 733872,
  yuki: 1468379,
  aaliyah: 1065081,
  giulia: 3756679,
  renata: 1544723,
  ingrid: 1821625,
  ethan: 1222271,
  kwame: 1462980,
  theo: 1310474,
  andre: 1688170,
  rafael: 1851164,
  kenji: 3211476,
  declan: 1559486,
  caleb: 1043474,
  henrik: 1181244,
  dorian: 2379005,
  vivian: 1988681,
  malcolm: 2710279,
  selena: 2014422,
  tristan: 2042109,
  noor: 2755038,
  garrett: 1181690,
  paloma: 2774556,
  ellis: 2087360,
  marisol: 2819543,
  desmond: 2835562,
  anika: 1181715,
  willem: 2867470,
  zara: 2878372,
  matteo: 2887719,
  brielle: 2896438,
  sven: 2122961,
  naia: 2916828,
  idris: 2927434,
  leila: 1816352,
  rhys: 2165644,
  corinne: 2182970,
  devon: 2653687,
  miriam: 3184405,
  jonah: 2233348,
  kira: 3184611,
  lars: 2272949,
  ophelia: 2291367,
  paco: 2302632,
  ruth: 2317953,
  stefan: 3324685,
  tara: 3394655,
  ulrich: 3398494,
  wren: 3626403,
  xavier: 3642639,
  yasmin: 3763184,
  zion: 3765538,
  alondra: 1916917,
  benji: 1933922,
  claudia: 1942095,
  derek: 1958439,
} as const;

export type DemoPhotoSetKey = keyof typeof DEMO_PHOTO_SET_PRIMARY;

const demoPrimaryIds = Object.values(DEMO_PHOTO_SET_PRIMARY);

const AI_PERSONA_PEXELS_ID_LIST = [
  1774960, 1784754, 1805418, 1814894, 1842478, 1861704, 1880318, 1889563, 1898633, 1907618,
] as const;

/** World / passport-only portraits (ids 201–218) — kept out of NYC batch sets. */
const PASSPORT_PORTRAIT_IDS = [
  3398464, 3408744, 3417775, 3389938, 3433333, 3409031, 3455279, 3468371, 3512868, 3483471,
  3493974, 3506189, 3516064, 3525544, 3535077, 3525074, 3558529, 3564325,
] as const;

/** Verified portrait ids (HTTP 200 JPEG) used for hero + companion shots. */
export const VERIFIED_PORTRAIT_IDS: readonly number[] = [
  ...new Set([
    ...LEGACY_PEXELS_IDS,
    ...demoPrimaryIds,
    ...AI_PERSONA_PEXELS_ID_LIST,
    ...PASSPORT_PORTRAIT_IDS,
  ]),
].filter((id) => !INVALID_PEXELS_IDS.has(id));

/** Three photos of the same person — one Pexels id, varied crops (carousel-safe). */
export function galleryForPrimary(primaryId: number): string[] {
  const pool = VERIFIED_PORTRAIT_IDS;
  let hero = primaryId;
  if (!pool.includes(hero) || INVALID_PEXELS_IDS.has(hero)) {
    hero = pool[hashNumber(primaryId) % pool.length] ?? pool[0];
  }
  return [portraitCrop(hero, 0), portraitCrop(hero, 1), portraitCrop(hero, 2)];
}

/** Build a demo photo array from a Pexels portrait id. */
export function photosForPexelsId(id: number): string[] {
  return galleryForPrimary(id);
}

/** Unique Pexels portrait per AI practice persona. */
export const AI_PERSONA_PEXELS_IDS: Record<string, number> = {
  'ai-nova': 1774960,
  'ai-sage': 1784754,
  'ai-riot': 1805418,
  'ai-luna': 1814894,
  'ai-muse': 1842478,
  'ai-atlas': 1861704,
  'ai-piper': 1880318,
  'ai-jett': 1889563,
  'ai-sloane': 1898633,
  'ai-remy': 1907618,
};

/** Default face focal point for portrait crops (center-top bias). */
export const PORTRAIT_FOCAL = { x: 0.5, y: 0.34 } as const;

export function photosForSet(key: DemoPhotoSetKey): string[] {
  return galleryForPrimary(DEMO_PHOTO_SET_PRIMARY[key]);
}
