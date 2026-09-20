import { AdminRole, parseAdminRole } from './rbac';

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminAllowlist(): string[] {
  return parseEmailList(process.env.EXPO_PUBLIC_ADMIN_ALLOWLIST);
}

const ENV_ROLE_MAP: { env: string; role: AdminRole }[] = [
  { env: 'EXPO_PUBLIC_ADMIN_SUPERADMINS', role: 'superadmin' },
  { env: 'EXPO_PUBLIC_ADMIN_PROFILE_EDITORS', role: 'profile_editor' },
  { env: 'EXPO_PUBLIC_ADMIN_MODERATORS', role: 'moderator' },
  { env: 'EXPO_PUBLIC_ADMIN_VIEWERS', role: 'viewer' },
];

export function isEmailAdminAllowlisted(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const allowlist = getAdminAllowlist();
  if (allowlist.length === 0) {
    // Dev fallback: only when explicitly enabled — never hardcode passwords.
    return process.env.EXPO_PUBLIC_ADMIN_DEV_OPEN === 'true';
  }
  return allowlist.includes(normalized);
}

export function resolveDefaultRoleFromEnv(email: string): AdminRole {
  const normalized = email.trim().toLowerCase();
  for (const { env, role } of ENV_ROLE_MAP) {
    const list = parseEmailList(process.env[env]);
    if (list.includes(normalized)) {
      return role;
    }
  }
  return 'viewer';
}
