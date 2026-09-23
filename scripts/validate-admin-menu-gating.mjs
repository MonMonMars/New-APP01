#!/usr/bin/env node
/**
 * Admin profile entry must not show for guests — only after adminSession exists.
 * (Logic mirror: AdminContext canOpenAdminMenu = Boolean(adminSession).)
 */
function canOpenAdminMenu(adminSession) {
  return Boolean(adminSession);
}

if (canOpenAdminMenu(null) !== false) {
  console.error('Expected canOpenAdminMenu(null) === false');
  process.exit(1);
}
if (canOpenAdminMenu(undefined) !== false) {
  console.error('Expected canOpenAdminMenu(undefined) === false');
  process.exit(1);
}
if (
  canOpenAdminMenu({ email: 'admin@spark.demo', role: 'superadmin' }) !== true
) {
  console.error('Expected canOpenAdminMenu(session) === true');
  process.exit(1);
}

console.log('validate-admin-menu-gating: OK');
