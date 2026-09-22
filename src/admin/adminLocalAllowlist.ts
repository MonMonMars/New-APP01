import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_ALLOWLIST_KEY = '@spark/admin_local_allowlist_v1';
const DEFAULT_SEEDED_KEY = '@spark/admin_default_seeded_v1';

export const DEFAULT_DEMO_ADMIN_EMAIL = 'admin@spark.demo';

let localAllowlistCache: string[] | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hydrateLocalAdminAllowlist(): Promise<void> {
  if (localAllowlistCache) {
    return;
  }
  try {
    const raw = await AsyncStorage.getItem(LOCAL_ALLOWLIST_KEY);
    localAllowlistCache = raw ? (JSON.parse(raw) as string[]).map(normalizeEmail) : [];
  } catch {
    localAllowlistCache = [];
  }
}

export function getLocalAdminAllowlist(): string[] {
  return localAllowlistCache ?? [];
}

export async function addLocalAdminEmail(email: string): Promise<void> {
  await hydrateLocalAdminAllowlist();
  const normalized = normalizeEmail(email);
  if (!normalized.includes('@')) {
    throw new Error('invalid_email');
  }
  const next = [...new Set([...(localAllowlistCache ?? []), normalized])];
  localAllowlistCache = next;
  await AsyncStorage.setItem(LOCAL_ALLOWLIST_KEY, JSON.stringify(next));
}

export async function removeLocalAdminEmail(email: string): Promise<void> {
  await hydrateLocalAdminAllowlist();
  const normalized = normalizeEmail(email);
  const next = (localAllowlistCache ?? []).filter((e) => e !== normalized);
  localAllowlistCache = next;
  await AsyncStorage.setItem(LOCAL_ALLOWLIST_KEY, JSON.stringify(next));
}

/** One-time seed: default demo superadmin + role assignment on device. */
export async function ensureDefaultAdminAccountSeeded(): Promise<void> {
  try {
    const done = await AsyncStorage.getItem(DEFAULT_SEEDED_KEY);
    if (done === '1') {
      return;
    }
    await hydrateLocalAdminAllowlist();
    if (!(localAllowlistCache ?? []).includes(DEFAULT_DEMO_ADMIN_EMAIL)) {
      await addLocalAdminEmail(DEFAULT_DEMO_ADMIN_EMAIL);
    }
    await AsyncStorage.setItem(DEFAULT_SEEDED_KEY, '1');
  } catch {
    // fail open — env allowlist may still work
  }
}
