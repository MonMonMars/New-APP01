import { Platform } from 'react-native';

import type { AccountRegionContext } from '../types/accountRegion';
import { PaymentMethodKind, PaymentRail } from '../types/purchases';
import { getPurchasesMode, isDemoPurchases } from './purchases';
import { isSupabaseConfigured } from './supabase';

export function isWebStripeCheckoutEnabled(region?: AccountRegionContext): boolean {
  if (region && !region.stripeWebCheckout) {
    return false;
  }
  return (
    process.env.EXPO_PUBLIC_WEB_PAYMENTS_ENABLED === 'true' &&
    isSupabaseConfigured() &&
    Platform.OS === 'web'
  );
}

export function resolvePaymentRail(method: PaymentMethodKind, region?: AccountRegionContext): PaymentRail {
  const resolved =
    method === 'platform_default'
      ? railForPlatformDefault(region)
      : method === 'stripe_checkout'
        ? 'stripe_checkout'
        : 'native_store';

  if (resolved === 'stripe_checkout' && !isWebStripeCheckoutEnabled(region)) {
    if (getPurchasesMode() === 'store' && Platform.OS !== 'web') {
      return 'native_store';
    }
    return isDemoPurchases() ? 'demo' : 'native_store';
  }

  if (resolved === 'native_store') {
    if (Platform.OS === 'web') {
      return isWebStripeCheckoutEnabled(region) ? 'stripe_checkout' : isDemoPurchases() ? 'demo' : 'stripe_checkout';
    }
    return getPurchasesMode() === 'store' ? 'native_store' : 'demo';
  }

  return resolved;
}

function railForPlatformDefault(region?: AccountRegionContext): PaymentRail {
  if (Platform.OS === 'web' && isWebStripeCheckoutEnabled(region)) {
    return 'stripe_checkout';
  }
  if (Platform.OS !== 'web' && region && !region.stripeWebCheckout) {
    return getPurchasesMode() === 'store' ? 'native_store' : 'demo';
  }
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return getPurchasesMode() === 'store' ? 'native_store' : 'demo';
  }
  return isDemoPurchases() ? 'demo' : 'native_store';
}

export type AvailablePaymentMethod = {
  kind: PaymentMethodKind;
  labelKey: string;
  descriptionKey: string;
};

export function listAvailablePaymentMethods(region?: AccountRegionContext): AvailablePaymentMethod[] {
  const recommendedDescKey =
    region?.countryCode === 'CN'
      ? 'payments.methodRecommendedDescCN'
      : 'payments.methodRecommendedDesc';
  const methods: AvailablePaymentMethod[] = [
    {
      kind: 'platform_default',
      labelKey: 'payments.methodRecommended',
      descriptionKey: recommendedDescKey,
    },
  ];

  if (Platform.OS === 'web' && isWebStripeCheckoutEnabled(region)) {
    methods.push({
      kind: 'stripe_checkout',
      labelKey: 'payments.methodStripe',
      descriptionKey: 'payments.methodStripeDesc',
    });
  }

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    methods.push({
      kind: 'native_store',
      labelKey: Platform.OS === 'ios' ? 'payments.methodApplePay' : 'payments.methodGooglePay',
      descriptionKey: 'payments.methodNativeStoreDesc',
    });
  }

  return methods;
}

/** User-facing checkout note when web card billing is unavailable for the account market. */
export function regionalPaymentNoticeKey(region: AccountRegionContext): string | null {
  if (region.countryCode === 'CN') {
    return 'payments.cnConsumerNotice';
  }
  return null;
}
