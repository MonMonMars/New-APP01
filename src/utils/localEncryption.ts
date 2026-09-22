import { getOrCreateVaultKey } from './secureStorage';

function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  const output = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 1) {
    output[i] = data[i] ^ key[i % key.length];
  }
  return output;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function keyToBytes(key: string): Uint8Array {
  return fromHex(key.length >= 64 ? key.slice(0, 64) : key.padEnd(64, '0'));
}

/** Device-local obfuscation for chat/match blobs in AsyncStorage. Not E2E encryption. */
export async function encryptLocalPayload(plainText: string): Promise<string> {
  const vaultKey = await getOrCreateVaultKey();
  const plainBytes = new TextEncoder().encode(plainText);
  const cipher = xorBytes(plainBytes, keyToBytes(vaultKey));
  return `enc1:${toHex(cipher)}`;
}

export async function decryptLocalPayload(payload: string): Promise<string | null> {
  if (!payload.startsWith('enc1:')) {
    return payload;
  }
  try {
    const vaultKey = await getOrCreateVaultKey();
    const cipher = fromHex(payload.slice(5));
    const plain = xorBytes(cipher, keyToBytes(vaultKey));
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}
