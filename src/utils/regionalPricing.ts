import type { PurchaseProductId } from '../types/purchases';
import type { AccountRegionContext } from '../types/accountRegion';

/** Display-only FX from USD catalog — checkout uses server amounts in local currency. */
const USD_TO_DISPLAY: Record<AccountRegionContext['currency'], number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149,
  TWD: 32,
  CNY: 7.2,
};

export function convertUsdForDisplay(usd: number, currency: AccountRegionContext['currency']): number {
  const rate = USD_TO_DISPLAY[currency];
  if (currency === 'JPY' || currency === 'TWD' || currency === 'CNY') {
    return Math.round(usd * rate);
  }
  return Math.round(usd * rate * 100) / 100;
}

export function formatRegionalPrice(usd: number, region: AccountRegionContext): string {
  const amount = convertUsdForDisplay(usd, region.currency);
  try {
    return new Intl.NumberFormat(region.localeTag, {
      style: 'currency',
      currency: region.currency,
      maximumFractionDigits: currencyHasCents(region.currency) ? 2 : 0,
    }).format(amount);
  } catch {
    return `$${usd.toFixed(2)}`;
  }
}

function currencyHasCents(currency: AccountRegionContext['currency']): boolean {
  return currency !== 'JPY' && currency !== 'TWD' && currency !== 'CNY';
}

/** Server-side cents for Stripe — mirrors display conversion. */
export function regionalAmountCentsFromUsd(usd: number, currency: AccountRegionContext['currency']): number {
  const amount = convertUsdForDisplay(usd, currency);
  if (!currencyHasCents(currency)) {
    return amount;
  }
  return Math.round(amount * 100);
}

export function regionalAmountCentsForProduct(
  productId: PurchaseProductId,
  usd: number,
  currency: AccountRegionContext['currency'],
): number {
  void productId;
  return regionalAmountCentsFromUsd(usd, currency);
}
