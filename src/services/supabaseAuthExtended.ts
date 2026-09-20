import { Linking, Platform } from 'react-native';

import { getMagicLinkRedirectTo } from './supabaseAuthCallback';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

function normalizeE164Phone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) {
    return null;
  }
  if (raw.trim().startsWith('+')) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export async function signInWithGoogleOAuth(): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const redirectTo = getMagicLinkRedirectTo();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && data.url) {
    window.location.assign(data.url);
    return { ok: true };
  }
  if (data.url) {
    const canOpen = await Linking.canOpenURL(data.url);
    if (canOpen) {
      await Linking.openURL(data.url);
      return { ok: true };
    }
    return { ok: false, error: 'Cannot open Google sign-in link' };
  }
  return { ok: false, error: 'Google sign-in unavailable' };
}

export async function sendPhoneLoginOtp(phoneRaw: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const phone = normalizeE164Phone(phoneRaw);
  if (!phone) {
    return { ok: false, error: 'Invalid phone number' };
  }
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function verifyPhoneLoginOtp(
  phoneRaw: string,
  token: string,
): Promise<{ userId: string | null; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { userId: null, error: 'Supabase not configured' };
  }
  const phone = normalizeE164Phone(phoneRaw);
  if (!phone) {
    return { userId: null, error: 'Invalid phone number' };
  }
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: token.trim(),
    type: 'sms',
  });
  if (error || !data.user) {
    return { userId: null, error: error?.message ?? 'Verification failed' };
  }
  return { userId: data.user.id };
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
): Promise<{ ok: boolean; needsEmailConfirm?: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const redirectTo = getMagicLinkRedirectTo();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return {
    ok: true,
    needsEmailConfirm: !data.session,
  };
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<{ userId: string | null; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { userId: null, error: 'Supabase not configured' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error || !data.user) {
    return { userId: null, error: error?.message ?? 'Sign-in failed' };
  }
  return { userId: data.user.id };
}

export async function requestPasswordResetEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const redirectTo = getMagicLinkRedirectTo();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function updateAccountPassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  if (newPassword.length < 8) {
    return { ok: false, error: 'Password too short' };
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function getAuthUserEmail(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export function isCloudAuthAvailable(): boolean {
  return isSupabaseConfigured();
}
