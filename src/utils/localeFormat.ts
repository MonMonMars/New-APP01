import type { AccountRegionContext } from '../types/accountRegion';
import type { AppLocale } from '../types/locale';

/** Format dates using account BCP 47 tag, with app-locale fallback. */
export function formatDateForAccountRegion(
  iso: string,
  region: AccountRegionContext,
  appLocale?: AppLocale | null,
): string {
  try {
    const tag =
      region.localeTag ||
      (appLocale === 'zh-TW' ? 'zh-TW' : 'en-US');
    return new Date(iso).toLocaleDateString(tag, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDateShortForAccountRegion(
  iso: string,
  region: AccountRegionContext,
  appLocale?: AppLocale | null,
): string {
  try {
    const tag =
      region.localeTag ||
      (appLocale === 'zh-TW' ? 'zh-TW' : 'en-US');
    return new Date(iso).toLocaleDateString(tag, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
