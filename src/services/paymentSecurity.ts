import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { checkClientRateLimit, isProductionBuild } from '../utils/securityGuards';
import { isSupabaseConfigured } from './supabase';
import { mfaHasVerifiedFactor, mfaVerifySensitiveAction } from './supabaseMfa';
import { getPurchasesMode } from './purchases';

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

export async function deviceBiometricsAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return false;
  }
  return LocalAuthentication.isEnrolledAsync();
}

async function promptBiometric(stepLabel: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: stepLabel,
    cancelLabel: 'Cancel',
    disableDeviceFallback: Platform.OS === 'ios',
  });
  return result.success;
}

export type PurchaseStepUpResult =
  | { ok: true; totpCode?: string }
  | { ok: false; message: string; code: 'verification_required' | 'verification_failed' | 'rate_limited' };

/**
 * Double authorization on every purchase:
 * - MFA + biometrics (native), or MFA + second TOTP (web)
 * - Two biometric prompts when MFA is off but device biometrics exist
 * - Web without MFA/biometrics: blocked (enroll MFA or use mobile app)
 */
export async function runPurchaseDoubleAuthorization(options: {
  userId: string | null;
  verificationCode?: string;
  verificationCodeConfirm?: string;
}): Promise<PurchaseStepUpResult> {
  if (!checkPurchaseRateLimit(options.userId)) {
    return { ok: false, code: 'rate_limited', message: 'Too many purchase attempts. Wait a few minutes.' };
  }

  const hasMfa = await mfaHasVerifiedFactor();
  const hasBio = await deviceBiometricsAvailable();

  if (hasMfa) {
    const code1 = options.verificationCode?.trim();
    if (!code1 || code1.length !== 6) {
      return {
        ok: false,
        code: 'verification_required',
        message: 'Enter your authenticator code (step 1 of 2).',
      };
    }
    const verified1 = await mfaVerifySensitiveAction(code1);
    if (!verified1.ok) {
      return {
        ok: false,
        code: 'verification_failed',
        message: verified1.error ?? 'Invalid verification code.',
      };
    }

    if (hasBio) {
      const bioOk = await promptBiometric('Confirm payment (step 2 of 2)');
      if (!bioOk) {
        return {
          ok: false,
          code: 'verification_failed',
          message: 'Biometric confirmation was cancelled.',
        };
      }
      return { ok: true, totpCode: code1 };
    }

    const code2 = options.verificationCodeConfirm?.trim();
    if (!code2 || code2.length !== 6) {
      return {
        ok: false,
        code: 'verification_required',
        message: 'Enter a second authenticator code (step 2 of 2).',
      };
    }
    if (code1 === code2) {
      return {
        ok: false,
        code: 'verification_failed',
        message: 'Use a new code from your authenticator for step 2.',
      };
    }
    const verified2 = await mfaVerifySensitiveAction(code2);
    if (!verified2.ok) {
      return {
        ok: false,
        code: 'verification_failed',
        message: verified2.error ?? 'Second verification code is invalid.',
      };
    }
    return { ok: true, totpCode: code1 };
  }

  if (hasBio) {
    const step1 = await promptBiometric('Verify identity (step 1 of 2)');
    if (!step1) {
      return {
        ok: false,
        code: 'verification_failed',
        message: 'Identity verification was cancelled.',
      };
    }
    const step2 = await promptBiometric('Confirm payment (step 2 of 2)');
    if (!step2) {
      return {
        ok: false,
        code: 'verification_failed',
        message: 'Payment confirmation was cancelled.',
      };
    }
    return { ok: true };
  }

  if (isSupabaseConfigured()) {
    return {
      ok: false,
      code: 'verification_failed',
      message: 'Enable two-factor authentication or use the iOS/Android app to pay securely.',
    };
  }

  return {
    ok: false,
    code: 'verification_failed',
    message: 'Secure payment requires biometrics or an authenticator app.',
  };
}

/** @deprecated Use runPurchaseDoubleAuthorization — kept for imports during migration. */
export async function runPurchaseStepUp(options: {
  userId: string | null;
  verificationCode?: string;
  requireCloudStepUp: boolean;
  verificationCodeConfirm?: string;
}): Promise<PurchaseStepUpResult> {
  void options.requireCloudStepUp;
  return runPurchaseDoubleAuthorization({
    userId: options.userId,
    verificationCode: options.verificationCode,
    verificationCodeConfirm: options.verificationCodeConfirm,
  });
}
