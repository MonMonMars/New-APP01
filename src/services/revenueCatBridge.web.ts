import { Platform } from 'react-native';

import {
  PurchaseErrorCode,
  PurchaseProductId,
  PurchaseRestoreResult,
  PurchaseResult,
} from '../types/purchases';

export function isNativeStoreBillingLinked(): boolean {
  return false;
}

export async function configureStorePurchases(_appUserId?: string | null): Promise<boolean> {
  return false;
}

function failure(code: PurchaseErrorCode, message: string): PurchaseResult {
  return { ok: false, code, message };
}

export function storeSetupMessage(): string {
  if (Platform.OS === 'web') {
    return 'In-app purchases are not available on web. Use the iOS or Android app.';
  }
  return 'Store billing requires a native build with react-native-purchases linked.';
}

export async function purchaseViaNativeStore(
  _productId: PurchaseProductId,
  _storeSku: string,
): Promise<PurchaseResult | null> {
  return null;
}

export async function restoreViaNativeStore(): Promise<PurchaseRestoreResult | null> {
  return null;
}
