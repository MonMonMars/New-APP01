export type AppLocale = 'en' | 'zh-TW';

export const APP_LOCALES: AppLocale[] = ['en', 'zh-TW'];

export const APP_LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  'zh-TW': '繁體中文',
};

export const APP_LOCALE_SHORT: Record<AppLocale, string> = {
  en: 'EN',
  'zh-TW': '繁中',
};

/** Resolve device / browser locale to a supported app locale. */
export function resolveDeviceLocale(): AppLocale {
  try {
    const raw =
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().locale
        : typeof navigator !== 'undefined'
          ? navigator.language
          : 'en';
    const normalized = raw.toLowerCase();
    if (normalized.startsWith('zh')) {
      return 'zh-TW';
    }
  } catch {
    // fall through
  }
  return 'en';
}

export function resolveAppLocale(
  preferred?: AppLocale | null,
  accountCountryCode?: string | null,
): AppLocale {
  if (preferred && APP_LOCALES.includes(preferred)) {
    return preferred;
  }
  if (accountCountryCode === 'CN' || accountCountryCode === 'TW') {
    return 'zh-TW';
  }
  return resolveDeviceLocale();
}
