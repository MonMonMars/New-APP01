import AsyncStorage from '@react-native-async-storage/async-storage';

const QUARANTINE_KEY = '@spark/scam_quarantine_v1';

let quarantinedIds: Set<string> | null = null;
const bonusScores = new Map<string, number>();

export async function hydrateScamEnforcement(): Promise<void> {
  if (quarantinedIds) {
    return;
  }
  try {
    const raw = await AsyncStorage.getItem(QUARANTINE_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    quarantinedIds = new Set(list.map((id) => id.trim()));
  } catch {
    quarantinedIds = new Set();
  }

  const { fetchActiveQuarantineFromCloud } = await import('../services/trustSafety');
  const cloudIds = await fetchActiveQuarantineFromCloud();
  for (const id of cloudIds) {
    quarantinedIds!.add(id);
    bonusScores.set(id, 50);
  }
}

/** Re-merge cloud quarantine (e.g. after sign-in). */
export async function syncSharedQuarantineFromCloud(): Promise<void> {
  const { fetchActiveQuarantineFromCloud } = await import('../services/trustSafety');
  const cloudIds = await fetchActiveQuarantineFromCloud();
  if (cloudIds.length === 0) {
    return;
  }
  await hydrateScamEnforcement();
  for (const id of cloudIds) {
    quarantinedIds!.add(id);
    bonusScores.set(id, 50);
  }
}

export function isProfileQuarantined(profileId: string): boolean {
  return quarantinedIds?.has(profileId) ?? false;
}

export function getQuarantinedProfileIds(): string[] {
  return [...(quarantinedIds ?? [])].sort();
}

export function getQuarantineBonusScore(profileId: string): number {
  return bonusScores.get(profileId) ?? 0;
}

export async function quarantineProfile(profileId: string): Promise<void> {
  await hydrateScamEnforcement();
  quarantinedIds!.add(profileId);
  bonusScores.set(profileId, 50);
  await AsyncStorage.setItem(QUARANTINE_KEY, JSON.stringify([...quarantinedIds!]));
  void import('../services/trustSafety').then((m) => m.setCloudQuarantine(profileId, true));
}

export async function clearProfileQuarantine(profileId: string): Promise<void> {
  await hydrateScamEnforcement();
  quarantinedIds!.delete(profileId);
  bonusScores.delete(profileId);
  await AsyncStorage.setItem(QUARANTINE_KEY, JSON.stringify([...quarantinedIds!]));
  void import('../services/trustSafety').then((m) => m.setCloudQuarantine(profileId, false));
}
