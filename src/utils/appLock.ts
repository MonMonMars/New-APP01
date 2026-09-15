import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

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

export async function authenticateWithBiometric(prompt: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const available = await isBiometricAvailable();
  if (!available) {
    return false;
  }
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
    fallbackLabel: 'Use PIN',
  });
  return result.success;
}

export async function unlockSpark(
  settings: SecuritySettings,
  pin?: string,
): Promise<{ ok: boolean; method: UnlockMethod }> {
  if (!settings.appLockEnabled) {
    return { ok: true, method: 'none' };
  }

  if (settings.biometricEnabled) {
    const biometricAvailable = await isBiometricAvailable();
    if (biometricAvailable) {
      const biometricOk = await authenticateWithBiometric('Unlock Spark');
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
