import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export async function deleteAccountViaEdgeFunction(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase client unavailable' };
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    return { ok: false, error: 'Not signed in' };
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = `Delete failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // ignore parse errors
    }
    return { ok: false, error: message };
  }

  await supabase.auth.signOut();
  return { ok: true };
}
