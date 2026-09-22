import { PRODUCT_CATALOG } from '../constants/products';
import { EntitlementGrant, PurchaseProductId } from '../types/purchases';
import { SparkPlusPlan } from '../types/subscription';

export function subscriptionExpiry(plan: SparkPlusPlan, from = Date.now()): string {
  const days = plan === 'weekly' ? 7 : plan === 'monthly' ? 30 : 365;
  return new Date(from + days * 24 * 60 * 60 * 1000).toISOString();
}

export function grantForProduct(productId: PurchaseProductId): EntitlementGrant {
  const product = PRODUCT_CATALOG[productId];

  if (product.kind === 'subscription' && product.plan) {
    const expiresAt = subscriptionExpiry(product.plan);
    return { sparkPlus: { plan: product.plan, expiresAt } };
  }

  const grant: EntitlementGrant = {};

  if (product.boostCount) {
    const toActivate = product.activateBoostOnPurchase ? 1 : 0;
    const toInventory = Math.max(0, product.boostCount - toActivate);
    if (toInventory > 0) {
      grant.bonusBoosts = toInventory;
    }
    if (toActivate > 0) {
      grant.activateBoost = true;
    }
  }

  if (product.sparkNoteCount) {
    grant.bonusSparkNotes = product.sparkNoteCount;
  }

  return grant;
}

export function productIdForStoreSku(storeSku: string): PurchaseProductId | null {
  for (const product of Object.values(PRODUCT_CATALOG)) {
    if (product.storeProductId === storeSku) {
      return product.id;
    }
  }
  return null;
}
