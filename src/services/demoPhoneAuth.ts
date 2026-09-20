import { normalizeAuthPhone } from './supabaseAuthExtended';

/** Demo-only SMS code when Supabase is not configured (previews / local dev). */
export const DEMO_PHONE_OTP_CODE = '123456';

const pendingPhones = new Set<string>();

export function demoPhoneOtpMarkSent(phoneRaw: string): boolean {
  const phone = normalizeAuthPhone(phoneRaw);
  if (!phone) {
    return false;
  }
  pendingPhones.add(phone);
  return true;
}

export function demoPhoneOtpVerify(phoneRaw: string, token: string): boolean {
  const phone = normalizeAuthPhone(phoneRaw);
  if (!phone) {
    return false;
  }
  if (!pendingPhones.has(phone)) {
    return false;
  }
  if (token.trim() !== DEMO_PHONE_OTP_CODE) {
    return false;
  }
  pendingPhones.delete(phone);
  return true;
}
