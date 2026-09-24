import { getSupabaseClient, getSupabaseSession, isSupabaseConfigured } from './supabase';

export type SecurityReportRow = {
  id: string;
  reporter_user_id: string | null;
  reported_profile_id: string;
  reason: string;
  context: string;
  status: string;
  created_at: string;
};

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

async function hasModeratorJwt(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }
  const { data } = await supabase.auth.getUser();
  const role = data.user?.app_metadata?.admin_role;
  return role === 'moderator' || role === 'superadmin';
}

/** Pull active quarantined profile ids from Supabase (all signed-in users). */
export async function fetchActiveQuarantineFromCloud(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const session = await getSupabaseSession();
  if (!session?.userId) {
    return [];
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from('scam_quarantine')
    .select('profile_id')
    .eq('active', true);

  if (error) {
    if (error.code === '42P01') {
      return [];
    }
    return [];
  }

  return (data ?? []).map((row) => String(row.profile_id));
}

export async function setCloudQuarantine(
  profileId: string,
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured' };
  }
  if (!(await hasModeratorJwt())) {
    return { ok: false, error: 'Moderator Supabase JWT required (app_metadata.admin_role)' };
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase client unavailable' };
  }

  const { data: userData } = await supabase.auth.getUser();
  const quarantinedBy = userData.user?.id ?? null;

  const { error } = await supabase.from('scam_quarantine').upsert(
    {
      profile_id: profileId,
      active,
      quarantined_by: active ? quarantinedBy : quarantinedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id' },
  );

  if (error) {
    if (error.code === '42P01') {
      return { ok: false, error: 'Run supabase-trust-safety-migration.sql' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function fetchModerationQueue(limit = 50): Promise<{
  ok: boolean;
  rows: SecurityReportRow[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { ok: false, rows: [], error: 'Supabase not configured' };
  }
  if (!(await hasModeratorJwt())) {
    return {
      ok: false,
      rows: [],
      error: 'Sign in to Supabase with a moderator JWT (app_metadata.admin_role) to view the queue.',
    };
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, rows: [], error: 'Supabase client unavailable' };
  }

  const { data, error } = await supabase
    .from('security_reports')
    .select('id, reporter_user_id, reported_profile_id, reason, context, status, created_at')
    .in('status', ['pending', 'reviewing'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === '42P01') {
      return { ok: false, rows: [], error: 'Run supabase-security-migration.sql' };
    }
    return { ok: false, rows: [], error: error.message };
  }

  return { ok: true, rows: (data ?? []) as SecurityReportRow[] };
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await hasModeratorJwt())) {
    return { ok: false, error: 'Moderator JWT required' };
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase client unavailable' };
  }
  const { error } = await supabase.from('security_reports').update({ status }).eq('id', reportId);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
