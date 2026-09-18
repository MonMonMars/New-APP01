import AsyncStorage from '@react-native-async-storage/async-storage';

import { PurchaseProductId, PurchaseTransaction } from '../types/purchases';

const HISTORY_KEY = '@spark/purchase_history';
const MAX_TRANSACTIONS = 100;

export async function loadPurchaseHistory(): Promise<PurchaseTransaction[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as PurchaseTransaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendPurchaseTransaction(tx: PurchaseTransaction): Promise<void> {
  const history = await loadPurchaseHistory();
  const next = [tx, ...history.filter((entry) => entry.id !== tx.id)].slice(0, MAX_TRANSACTIONS);
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Prototype — storage may fail in private browsing.
  }
}

export function findActiveSubscription(
  history: PurchaseTransaction[],
  now = Date.now(),
): PurchaseTransaction | null {
  const subscriptions = history.filter(
    (tx) => tx.productId.startsWith('spark_plus_') && tx.expiresAt && new Date(tx.expiresAt).getTime() > now,
  );
  if (subscriptions.length === 0) {
    return null;
  }
  return subscriptions.sort(
    (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
  )[0];
}

export function hasPurchasedProduct(history: PurchaseTransaction[], productId: PurchaseProductId): boolean {
  return history.some((tx) => tx.productId === productId);
}
