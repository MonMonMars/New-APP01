/** Curated portrait sets — multiple URLs per identity (same person, different framing). */

const u = (photoId: string, w = 800, h = 1000, crop = 'faces') =>
  `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&crop=${crop}&q=80`;

const p = (id: number, w = 800, h = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

/** Three crops from one Pexels portrait — guaranteed same person, face-forward framing. */
function pSet(id: number): string[] {
  return [p(id, 800, 1000), p(id, 800, 600), p(id, 600, 800)];
}

/** Same-person photo arrays keyed by set id — used when building demo profiles. */
export const DEMO_PHOTO_SETS = {
  maya: [u('1573496359142-b8d87734a5a2'), u('1573496359142-b8d87734a5a2', 800, 600, 'entropy'), u('1573497019943-4967731265f5')],
  elena: [u('1544005313-94ddf0286df2'), u('1544005313-94ddf0286df2', 800, 600, 'top'), u('1580489944761-15a19d654956')],
  nia: [u('1534528741775-53994a69daeb'), u('1534528741775-53994a69daeb', 800, 1000, 'entropy'), u('1524504388940-b1c1722653e1')],
  hannah: [u('1494790108377-be9c29b29330'), u('1494790108377-be9c29b29330', 800, 600, 'faces'), u('1438761681033-6461ffad8d80')],
  jade: [u('1531123897727-8f129e1688ce'), u('1531123897727-8f129e1688ce', 800, 600, 'entropy'), u('1487412720507-e7ab37603c6f')],
  vera: [p(1181686), p(1181686, 800, 600), p(1181686, 600, 800)],
  clara: [p(1587009), p(1587009, 800, 600), p(1587009, 600, 800)],
  iris: [p(1858175), p(1858175, 800, 600), p(1858175, 600, 800)],
  stephanie: [p(1771024), p(1771024, 800, 600), p(1771024, 600, 800)],
  mathilde: [p(2062362), p(2062362, 800, 600), p(2062362, 600, 800)],
  lucas: [u('1506794778202-cad84cf45f1d'), u('1506794778202-cad84cf45f1d', 800, 600, 'entropy'), u('1500648767791-00dcc994a43e')],
  daniel: [u('1507003211169-0a1dd7228f2d'), u('1507003211169-0a1dd7228f2d', 800, 600, 'top'), u('1519085360753-af0119f7cbe7')],
  marco: [u('1504257432389-52343af06da3'), u('1504257432389-52343af06da3', 800, 600, 'faces'), u('1552374196-1ab2a5c59363')],
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
} as const;

/** Default face focal point for portrait crops (center-top bias). */
export const PORTRAIT_FOCAL = { x: 0.5, y: 0.34 } as const;

export type DemoPhotoSetKey = keyof typeof DEMO_PHOTO_SETS;

export function photosForSet(key: DemoPhotoSetKey): string[] {
  return [...DEMO_PHOTO_SETS[key]];
}
