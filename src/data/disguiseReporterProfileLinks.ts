/**
 * Explicit Pulse reporter → woven demo profile links.
 * Avoids hash-based profile assignment for news persona rows.
 */
export const REPORTER_DEMO_PROFILE_IDS: Record<string, string> = {
  'rep-1a': '37',
  'rep-1b': '38',
  'rep-2a': '46',
  'rep-3a': '51',
  'rep-3b': '54',
  'rep-4a': '71',
  'rep-5a': '72',
  'rep-6a': '73',
  'rep-6b': '78',
  'rep-7a': '81',
  'rep-8a': '84',
  'rep-9a': '85',
  'rep-10a': '88',
  'rep-11a': '97',
  'rep-12a': '99',
  'rep-13a': '101',
  'rep-13b': '103',
  'rep-14a': '105',
};

export function reporterDemoProfileId(reporterId: string): string | undefined {
  return REPORTER_DEMO_PROFILE_IDS[reporterId];
}

/** Social post display name → woven demo profile (Activity + feed avatars). */
export const SOCIAL_AUTHOR_DEMO_PROFILE_IDS: Record<string, string> = {
  'Alex Chen': '82',
  'Maya O.': '97',
  'Jordan Lee': '2',
  'Priya N.': '37',
  'Marcus T.': '38',
  'Elena R.': '99',
  'Sam K.': '101',
  'Luca M.': '103',
  'Maya T.': '97',
  'Iris K.': '111',
  'Phoenix W.': '106',
  'Clara D.': '109',
  'Simon R.': '108',
  'Jade L.': '105',
};

export function socialAuthorDemoProfileId(author: string): string | undefined {
  return SOCIAL_AUTHOR_DEMO_PROFILE_IDS[author.trim()];
}

/** Demo profiles cycled onto live-fetched headlines (world / tech / culture). */
export const LIVE_NEWS_REPORTER_ROTATION: readonly string[] = [
  '37',
  '72',
  '81',
  '97',
  '105',
  '88',
  '51',
  '73',
];
