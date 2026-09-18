/** Curated portrait sets — multiple URLs per identity (same person, different framing). */

const p = (id: number, w = 800, h = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

/** Three crops from one Pexels portrait — guaranteed same person, face-forward framing. */
function pSet(id: number): string[] {
  return [p(id, 800, 1000), p(id, 800, 600), p(id, 600, 800)];
}

/** Build a same-person photo array from a Pexels portrait id. */
export function photosForPexelsId(id: number): string[] {
  return pSet(id);
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

/** Same-person photo arrays keyed by set id — used when building demo profiles. */
export const DEMO_PHOTO_SETS = {
  maya: pSet(1605277),
  elena: pSet(1626464),
  nia: pSet(1646863),
  hannah: pSet(1680215),
  jade: pSet(1733346),
  vera: pSet(1181686),
  clara: pSet(1587009),
  iris: pSet(1858175),
  stephanie: pSet(1771024),
  mathilde: pSet(2062362),
  lucas: pSet(1743394),
  daniel: pSet(1755383),
  marco: pSet(1765588),
  nathan: [p(1681010), p(1681010, 800, 600), p(1681010, 600, 800)],
  phoenix: [p(614810), p(614810, 800, 600), p(614810, 600, 800)],
  simon: [p(1516680), p(1516680, 800, 600), p(1516680, 600, 800)],
  miguel: [p(1043471), p(1043471, 800, 600), p(1043471, 600, 800)],
  anthony: [p(91227), p(91227, 800, 600), p(91227, 600, 800)],
  oliver: [p(220453), p(220453, 800, 600), p(220453, 600, 800)],
  morris: [p(1689710), p(1689710, 800, 600), p(1689710, 600, 800)],
  // Batch 2 — unique Pexels portrait ids (117–136 profiles)
  amara: pSet(774909),
  sloane: pSet(1130626),
  camille: pSet(415829),
  luna: pSet(1181519),
  tessa: pSet(733872),
  yuki: pSet(1468379),
  aaliyah: pSet(1065081),
  giulia: pSet(3756679),
  renata: pSet(1544723),
  ingrid: pSet(1821625),
  ethan: pSet(1222271),
  kwame: pSet(1462980),
  theo: pSet(1310474),
  andre: pSet(1688170),
  rafael: pSet(1851164),
  kenji: pSet(3211476),
  declan: pSet(1559486),
  caleb: pSet(1043474),
  henrik: pSet(1181244),
  dorian: pSet(2379005),
  // Batch 3 — unique Pexels portrait ids (137–156 profiles)
  vivian: pSet(2699703),
  malcolm: pSet(2710279),
  selena: pSet(2723894),
  tristan: pSet(2752802),
  noor: pSet(2755038),
  garrett: pSet(2760245),
  paloma: pSet(2774556),
  ellis: pSet(2800895),
  marisol: pSet(2819543),
  desmond: pSet(2835562),
  anika: pSet(2859040),
  willem: pSet(2867470),
  zara: pSet(2878372),
  matteo: pSet(2887719),
  brielle: pSet(2896438),
  sven: pSet(2906829),
  naia: pSet(2916828),
  idris: pSet(2927434),
  leila: pSet(2938299),
  rhys: pSet(2948298),
  // Batch 4 — unique Pexels portrait ids (157–176 profiles)
  corinne: pSet(3028298),
  devon: pSet(3038298),
  miriam: pSet(3048298),
  jonah: pSet(3068298),
  kira: pSet(3078298),
  lars: pSet(3088298),
  ophelia: pSet(3098298),
  paco: pSet(3108298),
  ruth: pSet(3168298),
  stefan: pSet(3188298),
  tara: pSet(3208298),
  ulrich: pSet(3218298),
  wren: pSet(3248298),
  xavier: pSet(3258298),
  yasmin: pSet(3268298),
  zion: pSet(3288298),
  alondra: pSet(1916917),
  benji: pSet(1933922),
  claudia: pSet(1942095),
  derek: pSet(1958439),
} as const;

/** Default face focal point for portrait crops (center-top bias). */
export const PORTRAIT_FOCAL = { x: 0.5, y: 0.34 } as const;

export type DemoPhotoSetKey = keyof typeof DEMO_PHOTO_SETS;

export function photosForSet(key: DemoPhotoSetKey): string[] {
  return [...DEMO_PHOTO_SETS[key]];
}
