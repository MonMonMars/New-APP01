import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PIN_HASH_KEY = 'spark_pin_hash';
const VAULT_KEY_KEY = 'spark_vault_key';
const SUPABASE_AUTH_PREFIX = 'spark_sb_auth_';

function canUseSecureStore(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function secureGetItem(key: string): Promise<string | null> {
  if (!canUseSecureStore()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  if (!canUseSecureStore()) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Web private mode — ignore.
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch {
    // Ignore write failures in prototype builds.
  }
}

export async function secureDeleteItem(key: string): Promise<void> {
  if (!canUseSecureStore()) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Ignore.
  }
}

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `spark-pin:${pin}`);
}

export async function getStoredPinHash(): Promise<string | null> {
  return secureGetItem(PIN_HASH_KEY);
}

export async function setStoredPinHash(hash: string): Promise<void> {
  await secureSetItem(PIN_HASH_KEY, hash);
}

export async function clearStoredPinHash(): Promise<void> {
  await secureDeleteItem(PIN_HASH_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getStoredPinHash();
  if (!stored) {
    return false;
  }
  const candidate = await hashPin(pin);
  return stored === candidate;
}

export async function getOrCreateVaultKey(): Promise<string> {
  const existing = await secureGetItem(VAULT_KEY_KEY);
  if (existing) {
    return existing;
  }
  const random = await Crypto.getRandomBytesAsync(32);
  const key = Array.from(random)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  await secureSetItem(VAULT_KEY_KEY, key);
  return key;
}

export async function clearVaultKey(): Promise<void> {
  await secureDeleteItem(VAULT_KEY_KEY);
}

/** Supabase auth session storage adapter (tokens in Keychain / SecureStore). */
export const supabaseSecureAuthStorage = {
  getItem: (key: string) => secureGetItem(`${SUPABASE_AUTH_PREFIX}${key}`),
  setItem: (key: string, value: string) => secureSetItem(`${SUPABASE_AUTH_PREFIX}${key}`, value),
  removeItem: (key: string) => secureDeleteItem(`${SUPABASE_AUTH_PREFIX}${key}`),
};
