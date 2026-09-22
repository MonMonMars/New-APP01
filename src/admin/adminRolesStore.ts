import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AdminRole } from './rbac';
import { parseAdminRole } from './rbac';
import {
  DEFAULT_DEMO_ADMIN_EMAIL,
  ensureDefaultAdminAccountSeeded,
  hydrateLocalAdminAllowlist,
} from './adminLocalAllowlist';
import { getAdminAllowlist, resolveDefaultRoleFromEnv } from './adminAllowlist';

const ROLES_KEY = '@spark/admin_role_assignments_v1';

export type AdminRoleAssignment = {
  email: string;
  role: AdminRole;
};

type RoleMap = Record<string, AdminRole>;

let roleCache: RoleMap | null = null;

export async function hydrateAdminRoles(): Promise<void> {
  await hydrateLocalAdminAllowlist();
  await ensureDefaultAdminAccountSeeded();
  if (roleCache) {
    return;
  }
  try {
    const raw = await AsyncStorage.getItem(ROLES_KEY);
    roleCache = raw ? (JSON.parse(raw) as RoleMap) : {};
  } catch {
    roleCache = {};
  }
  if (!roleCache[DEFAULT_DEMO_ADMIN_EMAIL]) {
    roleCache[DEFAULT_DEMO_ADMIN_EMAIL] = 'superadmin';
    await AsyncStorage.setItem(ROLES_KEY, JSON.stringify(roleCache));
  }
}

export async function listAdminRoleAssignments(): Promise<AdminRoleAssignment[]> {
  await hydrateAdminRoles();
  const allowlist = getAdminAllowlist();
  const emails = new Set<string>([
    ...allowlist,
    ...Object.keys(roleCache ?? {}).map((e) => e.toLowerCase()),
  ]);
  return [...emails].sort().map((email) => ({
    email,
    role: resolveAdminRoleForEmail(email),
  }));
}

export function resolveAdminRoleForEmail(email: string): AdminRole {
  const normalized = email.trim().toLowerCase();
  const fromStore = roleCache?.[normalized];
  const parsed = parseAdminRole(fromStore);
  if (parsed) {
    return parsed;
  }
  return resolveDefaultRoleFromEnv(normalized);
}

export async function setAdminRoleForEmail(email: string, role: AdminRole): Promise<void> {
  await hydrateAdminRoles();
  const normalized = email.trim().toLowerCase();
  roleCache = { ...(roleCache ?? {}), [normalized]: role };
  await AsyncStorage.setItem(ROLES_KEY, JSON.stringify(roleCache));
}

/** TODO(production): Sync with Supabase `admin_users` table and RLS — service role for writes. */
