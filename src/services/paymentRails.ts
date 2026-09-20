import { Platform } from 'react-native';

import { PaymentMethodKind, PaymentRail } from '../types/purchases';
import { getPurchasesMode, isDemoPurchases } from './purchases';
import { isSupabaseConfigured } from './supabase';

export function isWebStripeCheckoutEnabled(): boolean {
  return (
    process.env.EXPO_PUBLIC_WEB_PAYMENTS_ENABLED === 'true' &&
    isSupabaseConfigured() &&
    Platform.OS === 'web'
  );
}

export function resolvePaymentRail(method: PaymentMethodKind): PaymentRail {
  const resolved =
    method === 'platform_default'
      ? railForPlatformDefault()
      : method === 'stripe_checkout'
        ? 'stripe_checkout'
        : 'native_store';

  if (resolved === 'stripe_checkout' && !isWebStripeCheckoutEnabled()) {
    if (getPurchasesMode() === 'store' && Platform.OS !== 'web') {
      return 'native_store';
    }
    return isDemoPurchases() ? 'demo' : 'native_store';
  }

  if (resolved === 'native_store') {
    if (Platform.OS === 'web') {
      return isWebStripeCheckoutEnabled() ? 'stripe_checkout' : isDemoPurchases() ? 'demo' : 'stripe_checkout';
    }
    return getPurchasesMode() === 'store' ? 'native_store' : 'demo';
  }

  return resolved;
}

function railForPlatformDefault(): PaymentRail {
  if (Platform.OS === 'web' && isWebStripeCheckoutEnabled()) {
    return 'stripe_checkout';
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

export function listAvailablePaymentMethods(): AvailablePaymentMethod[] {
  const methods: AvailablePaymentMethod[] = [
    {
      kind: 'platform_default',
      labelKey: 'payments.methodRecommended',
      descriptionKey: 'payments.methodRecommendedDesc',
    },
  ];

  if (Platform.OS === 'web' && isWebStripeCheckoutEnabled()) {
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
