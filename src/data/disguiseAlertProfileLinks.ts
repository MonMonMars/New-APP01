/**
 * Explicit Activity alert persona → woven demo profile (matches Pulse news reporter map).
 */
export const ALERT_PERSON_DEMO_PROFILE_IDS: Record<string, string> = {
  'Priya N.': '37',
  'Marcus T.': '38',
};

export function alertDemoProfileId(personName: string): string | undefined {
  return ALERT_PERSON_DEMO_PROFILE_IDS[personName.trim()];
}
