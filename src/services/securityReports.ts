import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { sanitizeReportReason } from '../utils/securityGuards';

export type SecurityReportPayload = {
  reporterUserId: string;
  reportedProfileId: string;
  reason: string;
  context?: 'profile' | 'chat' | 'discover';
};

export async function submitSecurityReport(
  payload: SecurityReportPayload,
): Promise<{ ok: boolean; error?: string }> {
  const reason = sanitizeReportReason(payload.reason || 'No reason provided');
  const supabase = getSupabaseClient();

  if (!supabase || !isSupabaseConfigured()) {
    return { ok: true };
  }

  const { error } = await supabase.from('security_reports').insert({
    reporter_user_id: payload.reporterUserId,
    reported_profile_id: payload.reportedProfileId,
    reason,
    context: payload.context ?? 'profile',
    status: 'pending',
  });

  if (error) {
    if (error.code === '42P01') {
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function logSecurityEvent(
  userId: string | null,
  eventType: string,
  metadata?: Record<string, string>,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured() || !userId) {
    return;
  }

  await supabase.from('security_audit_events').insert({
    user_id: userId,
    event_type: eventType,
    metadata: metadata ?? {},
  });
}
