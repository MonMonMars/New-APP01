import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { SecuritySettings } from '../types/security';
import { verifyPin } from './secureStorage';

export type UnlockMethod = 'none' | 'biometric' | 'pin';

export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) {
    return false;
  }
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometric(
  prompt: string,
  locale?: AppLocale | null,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const resolvedLocale = resolveAppLocale(locale);
  const available = await isBiometricAvailable();
  if (!available) {
    return false;
  }
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    cancelLabel: translate(resolvedLocale, 'security.biometricCancel'),
    disableDeviceFallback: false,
    fallbackLabel: translate(resolvedLocale, 'security.biometricUsePin'),
  });
  return result.success;
}

export async function unlockSpark(
  settings: SecuritySettings,
  pin?: string,
  leaveLabel = 'Spark',
  locale?: AppLocale | null,
): Promise<{ ok: boolean; method: UnlockMethod }> {
  const resolvedLocale = resolveAppLocale(locale);
  if (!settings.appLockEnabled) {
    return { ok: true, method: 'none' };
  }

  if (settings.biometricEnabled) {
    const biometricAvailable = await isBiometricAvailable();
    if (biometricAvailable) {
      const biometricOk = await authenticateWithBiometric(
        translate(resolvedLocale, 'security.biometricLeavePrompt', { appName: leaveLabel }),
        resolvedLocale,
      );
      if (biometricOk) {
        return { ok: true, method: 'biometric' };
      }
    } else if (!settings.pinEnabled) {
      // Web and other platforms without biometrics can still leave disguise when no PIN is set.
      return { ok: true, method: 'none' };
    }
  }

  if (settings.pinEnabled && pin) {
    const pinOk = await verifyPin(pin);
    if (pinOk) {
      return { ok: true, method: 'pin' };
    }
    return { ok: false, method: 'pin' };
  }

  if (settings.pinEnabled && !pin) {
    return { ok: false, method: 'pin' };
  }

  if (!settings.biometricEnabled && !settings.pinEnabled) {
    return { ok: true, method: 'none' };
  }

  return { ok: false, method: 'biometric' };
}
