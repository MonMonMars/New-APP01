import { PASSPORT_CITIES } from '../types/preferences';
import type { AppLocale } from '../types/locale';
import {
  AccountCountryCode,
  AccountMarketGroup,
  AccountRegionContext,
  RegionalAuthTab,
} from '../types/accountRegion';
import type { DiscoveryPreferences } from '../types/preferences';

const EU_COUNTRY_CODES = new Set<AccountCountryCode>(['FR', 'DE', 'EU']);

function marketForCountry(country: AccountCountryCode): AccountMarketGroup {
  switch (country) {
    case 'US':
    case 'CA':
      return 'americas';
    case 'GB':
      return 'uk';
    case 'FR':
    case 'DE':
    case 'EU':
      return 'europe';
    case 'TW':
      return 'taiwan';
    case 'JP':
    case 'AU':
      return 'apac';
    default:
      return 'other';
  }
}

function currencyForCountry(country: AccountCountryCode): AccountRegionContext['currency'] {
  switch (country) {
    case 'GB':
      return 'GBP';
    case 'FR':
    case 'DE':
    case 'EU':
      return 'EUR';
    case 'CA':
      return 'CAD';
    case 'AU':
      return 'AUD';
    case 'JP':
      return 'JPY';
    case 'TW':
      return 'TWD';
    case 'US':
    default:
      return 'USD';
  }
}

function localeTagFor(country: AccountCountryCode, appLocale?: AppLocale | null): string {
  if (appLocale === 'zh-TW' || country === 'TW') {
    return 'zh-TW';
  }
  switch (country) {
    case 'FR':
      return 'fr-FR';
    case 'DE':
      return 'de-DE';
    case 'JP':
      return 'ja-JP';
    case 'GB':
      return 'en-GB';
    case 'AU':
      return 'en-AU';
    default:
      return 'en-US';
  }
}

/** Map onboarding passport city keys to account country (Tinder/Bumble-style home market). */
export function countryCodeFromPassportCity(passportCity: string | undefined): AccountCountryCode | null {
  if (!passportCity) {
    return null;
  }
  if ((PASSPORT_CITIES as readonly string[]).includes(passportCity)) {
    if (passportCity.endsWith(', UK')) {
      return 'GB';
    }
    if (passportCity === 'Paris, France') {
      return 'FR';
    }
    if (passportCity === 'Tokyo, Japan') {
      return 'JP';
    }
    if (passportCity === 'Sydney, Australia') {
      return 'AU';
    }
    if (passportCity === 'Taipei, Taiwan') {
      return 'TW';
    }
    return 'US';
  }
  const lower = passportCity.toLowerCase();
  if (lower.includes('taiwan') || lower.includes('taipei') || lower.includes('台')) {
    return 'TW';
  }
  if (lower.includes('uk') || lower.includes('london')) {
    return 'GB';
  }
  if (lower.includes('france') || lower.includes('paris')) {
    return 'FR';
  }
  if (lower.includes('germany') || lower.includes('berlin')) {
    return 'DE';
  }
  if (lower.includes('japan') || lower.includes('tokyo')) {
    return 'JP';
  }
  if (lower.includes('australia') || lower.includes('sydney')) {
    return 'AU';
  }
  if (lower.includes('canada') || lower.includes('toronto') || lower.includes('vancouver')) {
    return 'CA';
  }
  return null;
}

function inferCountryFromTimezone(): AccountCountryCode | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    if (tz.includes('Taipei') || tz === 'Asia/Taipei') {
      return 'TW';
    }
    if (tz.startsWith('Europe/London')) {
      return 'GB';
    }
    if (tz.startsWith('Europe/Paris') || tz.startsWith('Europe/Berlin')) {
      return tz.includes('Berlin') ? 'DE' : 'FR';
    }
    if (tz.startsWith('Australia/')) {
      return 'AU';
    }
    if (tz.startsWith('Asia/Tokyo')) {
      return 'JP';
    }
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) {
      return 'CA';
    }
    if (tz.startsWith('America/')) {
      return 'US';
    }
  } catch {
    // ignore
  }
  return null;
}

function normalizeCountryCode(raw: string | undefined | null): AccountCountryCode | null {
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  const code = raw.trim().toUpperCase();
  if (code === 'UK') {
    return 'GB';
  }
  const allowed: AccountCountryCode[] = ['US', 'GB', 'FR', 'DE', 'EU', 'CA', 'AU', 'JP', 'TW', 'OTHER'];
  if (allowed.includes(code as AccountCountryCode)) {
    return code as AccountCountryCode;
  }
  if (EU_COUNTRY_CODES.has(code as AccountCountryCode)) {
    return code as AccountCountryCode;
  }
  return null;
}

export function resolveAccountRegion(preferences: DiscoveryPreferences): AccountRegionContext {
  const fromPref = normalizeCountryCode(preferences.accountCountryCode);
  const fromCity = countryCodeFromPassportCity(preferences.passportCity);
  const fromLocale = preferences.appLocale === 'zh-TW' ? 'TW' : null;
  const fromTz = inferCountryFromTimezone();

  const countryCode: AccountCountryCode =
    fromPref ?? fromCity ?? (fromLocale as AccountCountryCode) ?? fromTz ?? 'US';

  const market = marketForCountry(countryCode);
  const currency = currencyForCountry(countryCode);
  const localeTag = localeTagFor(countryCode, preferences.appLocale);

  const stripeWebCheckout =
    countryCode === 'US' ||
    countryCode === 'CA' ||
    countryCode === 'GB' ||
    countryCode === 'AU' ||
    countryCode === 'JP' ||
    countryCode === 'TW' ||
    EU_COUNTRY_CODES.has(countryCode);

  const phoneAuthPrimary = countryCode === 'TW' || countryCode === 'JP' || market === 'apac';

  return {
    countryCode,
    market,
    localeTag,
    currency,
    stripeWebCheckout,
    phoneAuthPrimary,
  };
}

/** Auth tab order — phone-first in APAC/Taiwan like LINE-style apps; email-first in US/EU like Hinge. */
export function regionalAuthTabOrder(region: AccountRegionContext): RegionalAuthTab[] {
  if (region.phoneAuthPrimary) {
    return ['phone', 'email', 'password'];
  }
  if (region.market === 'europe' || region.market === 'uk') {
    return ['email', 'password', 'phone'];
  }
  return ['email', 'phone', 'password'];
}

export function regionalDefaultAuthTab(region: AccountRegionContext): RegionalAuthTab {
  return regionalAuthTabOrder(region)[0];
}
