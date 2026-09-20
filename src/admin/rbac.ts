export type AdminRole = 'viewer' | 'moderator' | 'profile_editor' | 'superadmin';

export type AdminPermission =
  | 'canAccessAdmin'
  | 'canViewInternalProfileMetadata'
  | 'canViewDemoBillingHints'
  | 'canEditProfiles'
  | 'canToggleDemoFlag'
  | 'canManageAdmins'
  | 'canViewAnalytics'
  | 'canRunBackendActions';

const ROLE_PERMISSIONS: Record<AdminRole, ReadonlySet<AdminPermission>> = {
  viewer: new Set([
    'canAccessAdmin',
    'canViewInternalProfileMetadata',
    'canViewAnalytics',
  ]),
  moderator: new Set([
    'canAccessAdmin',
    'canViewInternalProfileMetadata',
    'canViewAnalytics',
    'canRunBackendActions',
  ]),
  profile_editor: new Set([
    'canAccessAdmin',
    'canViewInternalProfileMetadata',
    'canViewAnalytics',
    'canEditProfiles',
    'canToggleDemoFlag',
  ]),
  superadmin: new Set([
    'canAccessAdmin',
    'canViewInternalProfileMetadata',
    'canViewDemoBillingHints',
    'canEditProfiles',
    'canToggleDemoFlag',
    'canManageAdmins',
    'canViewAnalytics',
    'canRunBackendActions',
  ]),
};

export function adminHasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  viewer: 'Viewer',
  moderator: 'Moderator',
  profile_editor: 'Profile editor',
  superadmin: 'Super admin',
};

/** RBAC matrix for docs / PR — permission → roles that grant it. */
export const RBAC_MATRIX: { permission: AdminPermission; roles: AdminRole[] }[] = [
  { permission: 'canAccessAdmin', roles: ['viewer', 'moderator', 'profile_editor', 'superadmin'] },
  {
    permission: 'canViewInternalProfileMetadata',
    roles: ['viewer', 'moderator', 'profile_editor', 'superadmin'],
  },
  { permission: 'canViewAnalytics', roles: ['viewer', 'moderator', 'profile_editor', 'superadmin'] },
  { permission: 'canRunBackendActions', roles: ['moderator', 'superadmin'] },
  { permission: 'canEditProfiles', roles: ['profile_editor', 'superadmin'] },
  { permission: 'canToggleDemoFlag', roles: ['profile_editor', 'superadmin'] },
  { permission: 'canManageAdmins', roles: ['superadmin'] },
  { permission: 'canViewDemoBillingHints', roles: ['superadmin'] },
];

export function parseAdminRole(value: unknown): AdminRole | null {
  switch (value) {
    case 'viewer':
    case 'moderator':
    case 'profile_editor':
    case 'superadmin':
      return value;
    default:
      return null;
  }
}

export const ADMIN_ROLES_ORDER: AdminRole[] = [
  'viewer',
  'moderator',
  'profile_editor',
  'superadmin',
];
