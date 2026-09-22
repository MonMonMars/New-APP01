import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';

export function getHoursUntilExpiry(expiresAt: string | undefined): number | null {
  if (!expiresAt) {
    return null;
  }
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return 0;
  }
  return Math.ceil(remainingMs / 3600000);
}

export function getMinutesUntilExpiry(expiresAt: string | undefined): number | null {
  if (!expiresAt) {
    return null;
  }
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return 0;
  }
  return Math.ceil(remainingMs / 60000);
}

export function formatExpiresIn(expiresAt: string | undefined, locale?: AppLocale | null): string | null {
  if (!expiresAt) {
    return null;
  }
  const lang = resolveAppLocale(locale);
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return translate(lang, 'matches.expired');
  }

  const totalMinutes = Math.ceil(remainingMs / 60000);
  if (totalMinutes < 60) {
    return translate(lang, 'matches.expiresMinutes', { m: totalMinutes });
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) {
    return minutes > 0
      ? translate(lang, 'matches.expiresHoursMinutes', { h: hours, m: minutes })
      : translate(lang, 'matches.expiresHours', { h: hours });
  }

  const days = Math.ceil(hours / 24);
  return translate(lang, 'matches.expiresDays', { d: days });
}
