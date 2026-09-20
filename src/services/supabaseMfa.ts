import { getSupabaseClient } from './supabase';

export type MfaEnrollResult = {
  ok: boolean;
  factorId?: string;
  qrSvg?: string;
  secret?: string;
  error?: string;
};

export async function mfaNeedsVerificationStep(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) {
    return false;
  }
  return data.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
}

export async function mfaHasVerifiedFactor(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) {
    return false;
  }
  return data.totp.some((factor) => factor.status === 'verified');
}

export async function mfaEnrollTotp(friendlyName = 'Authenticator'): Promise<MfaEnrollResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  });
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Enrollment failed' };
  }
  return {
    ok: true,
    factorId: data.id,
    qrSvg: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function mfaVerifyEnrollment(factorId: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error || !challenge.data) {
    return { ok: false, error: challenge.error?.message ?? 'Challenge failed' };
  }
  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code: code.trim(),
  });
  if (verify.error) {
    return { ok: false, error: verify.error.message };
  }
  return { ok: true };
}

export async function mfaVerifyLoginStep(code: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const factors = await supabase.auth.mfa.listFactors();
  if (factors.error || !factors.data) {
    return { ok: false, error: factors.error?.message ?? 'No MFA factors' };
  }
  const factor = factors.data.totp.find((item) => item.status === 'verified');
  if (!factor) {
    return { ok: false, error: 'No verified authenticator' };
  }
  const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (challenge.error || !challenge.data) {
    return { ok: false, error: challenge.error?.message ?? 'Challenge failed' };
  }
  const verify = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.data.id,
    code: code.trim(),
  });
  if (verify.error) {
    return { ok: false, error: verify.error.message };
  }
  return { ok: true };
}

/** Second factor for purchases — re-challenges TOTP without changing session level rules. */
export async function mfaVerifySensitiveAction(code: string): Promise<{ ok: boolean; error?: string }> {
  return mfaVerifyLoginStep(code);
}

export async function mfaUnenrollAll(): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'List factors failed' };
  }
  for (const factor of data.totp) {
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (unenrollError) {
      return { ok: false, error: unenrollError.message };
    }
  }
  return { ok: true };
}
