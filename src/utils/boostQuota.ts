/** ISO week key for Spark+ free weekly boost tracking (e.g. "2026-W38"). */
export function getIsoWeekKey(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
}

export type BoostActivationResult =
  | { ok: true; source: 'free_weekly' | 'bonus' | 'purchased' }
  | { ok: false; reason: 'already_active' | 'quota_exhausted' };
