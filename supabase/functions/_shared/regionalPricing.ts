import type { ServerProductId } from './paymentProducts.ts';
import { SERVER_PRODUCT_CATALOG } from './paymentProducts.ts';

export type CheckoutCurrency = 'usd' | 'eur' | 'gbp' | 'cad' | 'aud' | 'jpy' | 'twd' | 'cny';

const USD_TO: Record<CheckoutCurrency, number> = {
  usd: 1,
  eur: 0.92,
  gbp: 0.79,
  cad: 1.36,
  aud: 1.52,
  jpy: 149,
  twd: 32,
  cny: 7.2,
};

export function currencyForCountry(country: string | undefined): CheckoutCurrency {
  const c = (country ?? 'US').toUpperCase();
  switch (c) {
    case 'GB':
    case 'UK':
      return 'gbp';
    case 'FR':
    case 'DE':
    case 'EU':
      return 'eur';
    case 'CA':
      return 'cad';
    case 'AU':
      return 'aud';
    case 'JP':
      return 'jpy';
    case 'TW':
      return 'twd';
    case 'CN':
      return 'cny';
    default:
      return 'usd';
  }
}

export function regionalCentsForProduct(productId: ServerProductId, country: string | undefined): {
  currency: CheckoutCurrency;
  amountCents: number;
} {
  const product = SERVER_PRODUCT_CATALOG[productId];
  const usd = product.amountCents / 100;
  const currency = currencyForCountry(country);
  const rate = USD_TO[currency];
  if (currency === 'jpy' || currency === 'twd' || currency === 'cny') {
    const units = Math.round(usd * rate);
    return { currency, amountCents: units };
  }
  const local = Math.round(usd * rate * 100);
  return { currency, amountCents: local };
}
