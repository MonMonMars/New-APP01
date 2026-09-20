/** Server-side catalog — amounts must match src/constants/products.ts display prices. */

export type ServerProductId =
  | 'spark_plus_weekly'
  | 'spark_plus_monthly'
  | 'spark_plus_annual'
  | 'boost_1'
  | 'boost_3'
  | 'spark_notes_1'
  | 'spark_notes_5';

export type ServerProduct = {
  id: ServerProductId;
  kind: 'subscription' | 'consumable';
  amountCents: number;
  currency: 'usd';
  plan?: 'weekly' | 'monthly' | 'annual';
  boostCount?: number;
  sparkNoteCount?: number;
  activateBoostOnPurchase?: boolean;
};

export const SERVER_PRODUCT_CATALOG: Record<ServerProductId, ServerProduct> = {
  spark_plus_weekly: {
    id: 'spark_plus_weekly',
    kind: 'subscription',
    amountCents: 1299,
    currency: 'usd',
    plan: 'weekly',
  },
  spark_plus_monthly: {
    id: 'spark_plus_monthly',
    kind: 'subscription',
    amountCents: 1499,
    currency: 'usd',
    plan: 'monthly',
  },
  spark_plus_annual: {
    id: 'spark_plus_annual',
    kind: 'subscription',
    amountCents: 9999,
    currency: 'usd',
    plan: 'annual',
  },
  boost_1: {
    id: 'boost_1',
    kind: 'consumable',
    amountCents: 399,
    currency: 'usd',
    boostCount: 1,
    activateBoostOnPurchase: true,
  },
  boost_3: {
    id: 'boost_3',
    kind: 'consumable',
    amountCents: 999,
    currency: 'usd',
    boostCount: 3,
    activateBoostOnPurchase: true,
  },
  spark_notes_1: {
    id: 'spark_notes_1',
    kind: 'consumable',
    amountCents: 199,
    currency: 'usd',
    sparkNoteCount: 1,
  },
  spark_notes_5: {
    id: 'spark_notes_5',
    kind: 'consumable',
    amountCents: 499,
    currency: 'usd',
    sparkNoteCount: 5,
  },
};

export function isServerProductId(value: string): value is ServerProductId {
  return value in SERVER_PRODUCT_CATALOG;
}

export function grantForServerProduct(productId: ServerProductId): Record<string, unknown> {
  const product = SERVER_PRODUCT_CATALOG[productId];
  if (product.kind === 'subscription' && product.plan) {
    const expiresAt = subscriptionExpiryIso(product.plan);
    return {
      sparkPlus: { plan: product.plan, expiresAt },
    };
  }
  const grant: Record<string, unknown> = {};
  if (product.boostCount) {
    grant.bonusBoosts = product.boostCount;
    if (product.activateBoostOnPurchase) {
      grant.activateBoost = true;
    }
  }
  if (product.sparkNoteCount) {
    grant.bonusSparkNotes = product.sparkNoteCount;
  }
  return grant;
}

function subscriptionExpiryIso(plan: 'weekly' | 'monthly' | 'annual'): string {
  const now = Date.now();
  const ms =
    plan === 'weekly'
      ? 7 * 24 * 60 * 60 * 1000
      : plan === 'monthly'
        ? 30 * 24 * 60 * 60 * 1000
        : 365 * 24 * 60 * 60 * 1000;
  return new Date(now + ms).toISOString();
}
