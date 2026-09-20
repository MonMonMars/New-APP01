import * as LocalAuthentication from 'expo-local-authentication';

import { checkClientRateLimit, isProductionBuild } from '../utils/securityGuards';
import { isSupabaseConfigured } from './supabase';
import { mfaHasVerifiedFactor, mfaVerifySensitiveAction } from './supabaseMfa';
import { getPurchasesMode } from './purchases';
import { Platform } from 'react-native';

const PURCHASE_RATE_MAX = 8;
const PURCHASE_RATE_WINDOW_MS = 10 * 60 * 1000;

export function createPurchaseIdempotencyKey(userId: string | null, productId: string): string {
  const uid = userId ?? 'local';
  return `pay_${uid}_${productId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function checkPurchaseRateLimit(userId: string | null): boolean {
  const key = `purchase:${userId ?? 'guest'}`;
  return checkClientRateLimit(key, PURCHASE_RATE_MAX, PURCHASE_RATE_WINDOW_MS);
}

/** Block unverified demo billing in production cloud builds. */
export function isDemoPurchaseBlockedInProduction(): boolean {
  return isProductionBuild() && isSupabaseConfigured() && getPurchasesMode() === 'demo';
}

export type PurchaseStepUpResult =
  | { ok: true; totpCode?: string }
  | { ok: false; message: string; code: 'verification_required' | 'verification_failed' | 'rate_limited' };

export async function runPurchaseStepUp(options: {
  userId: string | null;
  verificationCode?: string;
  requireCloudStepUp: boolean;
}): Promise<PurchaseStepUpResult> {
  if (!checkPurchaseRateLimit(options.userId)) {
    return { ok: false, code: 'rate_limited', message: 'Too many purchase attempts. Wait a few minutes.' };
  }

  if (!options.requireCloudStepUp) {
    return { ok: true };
  }

  const hasMfa = await mfaHasVerifiedFactor();
  if (hasMfa) {
    if (!options.verificationCode?.trim()) {
      return {
        ok: false,
        code: 'verification_required',
        message: 'Enter your authenticator code to approve this purchase.',
      };
    }
    const verified = await mfaVerifySensitiveAction(options.verificationCode);
    if (!verified.ok) {
      return {
        ok: false,
        code: 'verification_failed',
        message: verified.error ?? 'Invalid verification code.',
      };
    }
    return { ok: true, totpCode: options.verificationCode.trim() };
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (hasHardware && enrolled) {
    const bio = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm purchase',
      cancelLabel: 'Cancel',
      disableDeviceFallback: Platform.OS === 'ios',
    });
    if (!bio.success) {
      return {
        ok: false,
        code: 'verification_failed',
        message: 'Purchase confirmation was cancelled.',
      };
    }
    return { ok: true };
  }

  return { ok: true };
}
