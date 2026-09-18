/** Curated portrait sets — multiple URLs per identity (same person, different framing). */

const u = (photoId: string, w = 800, h = 1000, crop = 'faces') =>
  `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&crop=${crop}&q=80`;

const p = (id: number, w = 800, h = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

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
} as const;

export type DemoPhotoSetKey = keyof typeof DEMO_PHOTO_SETS;

export function photosForSet(key: DemoPhotoSetKey): string[] {
  return [...DEMO_PHOTO_SETS[key]];
}
