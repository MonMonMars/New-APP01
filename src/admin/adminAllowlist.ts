import { DEFAULT_DEMO_ADMIN_EMAIL, getLocalAdminAllowlist } from './adminLocalAllowlist';
import { AdminRole } from './rbac';

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Emails from build-time env only. */
export function getEnvAdminAllowlist(): string[] {
  return parseEmailList(process.env.EXPO_PUBLIC_ADMIN_ALLOWLIST);
}

/** Env + device-local invites + built-in demo default (unless disabled). */
export function getAdminAllowlist(): string[] {
  const env = getEnvAdminAllowlist();
  const local = getLocalAdminAllowlist();
  const merged = new Set<string>([...env, ...local]);
  if (env.length === 0 && process.env.EXPO_PUBLIC_ADMIN_DISABLE_DEFAULT !== 'true') {
    merged.add(DEFAULT_DEMO_ADMIN_EMAIL);
  }
  return [...merged];
}

const ENV_ROLE_MAP: { env: string; role: AdminRole }[] = [
  { env: 'EXPO_PUBLIC_ADMIN_SUPERADMINS', role: 'superadmin' },
  { env: 'EXPO_PUBLIC_ADMIN_PROFILE_EDITORS', role: 'profile_editor' },
  { env: 'EXPO_PUBLIC_ADMIN_MODERATORS', role: 'moderator' },
  { env: 'EXPO_PUBLIC_ADMIN_VIEWERS', role: 'viewer' },
];

export function isAdminDevOpen(): boolean {
  return process.env.EXPO_PUBLIC_ADMIN_DEV_OPEN === 'true';
}

export function getAdminDemoPin(): string | null {
  const pin = process.env.EXPO_PUBLIC_ADMIN_DEMO_PIN?.trim();
  return pin && pin.length >= 4 ? pin : null;
}

export function verifyAdminDemoPin(pin: string): boolean {
  const expected = getAdminDemoPin();
  if (!expected) {
    return true;
  }
  return pin.trim() === expected;
}

export function isEmailAdminAllowlisted(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (isAdminDevOpen()) {
    return true;
  }
  return getAdminAllowlist().includes(normalized);
}

export function resolveDefaultRoleFromEnv(email: string): AdminRole {
  const normalized = email.trim().toLowerCase();
  for (const { env, role } of ENV_ROLE_MAP) {
    const list = parseEmailList(process.env[env]);
    if (list.includes(normalized)) {
      return role;
    }
  }
  if (
    normalized === DEFAULT_DEMO_ADMIN_EMAIL &&
    getEnvAdminAllowlist().length === 0 &&
    process.env.EXPO_PUBLIC_ADMIN_DISABLE_DEFAULT !== 'true'
  ) {
    return 'superadmin';
  }
  return 'viewer';
}

