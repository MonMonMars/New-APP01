/** ISO 3166-1 alpha-2 — account home market (onboarding / profile), not live GPS. */
export type AccountCountryCode =
  | 'US'
  | 'GB'
  | 'FR'
  | 'DE'
  | 'EU'
  | 'CA'
  | 'AU'
  | 'JP'
  | 'TW'
  | 'OTHER';

export type AccountMarketGroup = 'americas' | 'europe' | 'uk' | 'apac' | 'taiwan' | 'other';

export type AccountRegionContext = {
  countryCode: AccountCountryCode;
  market: AccountMarketGroup;
  /** BCP 47 for formatting prices and dates */
  localeTag: string;
  /** ISO 4217 checkout / display currency */
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'TWD';
  /** Stripe Checkout supported for this account market (web) */
  stripeWebCheckout: boolean;
  /** Phone OTP is a primary sign-in method in this market */
  phoneAuthPrimary: boolean;
};

export type RegionalAuthTab = 'email' | 'phone' | 'password';
