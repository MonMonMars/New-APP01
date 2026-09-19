import { Share, Platform } from 'react-native';

import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { PersistedAppState } from './persistence';

export type ExportableUserData = {
  exportedAt: string;
  userId: string | null;
  profile: PersistedAppState['user'];
  preferences: PersistedAppState['preferences'];
  matches: PersistedAppState['matches'];
  likedProfileIds: string[];
  blockedProfileIds: string[];
  notificationPreferences: PersistedAppState['notificationPreferences'];
  privacyPreferences?: unknown;
  legalConsent?: unknown;
};

export function buildUserDataExport(state: PersistedAppState): ExportableUserData {
  return {
    exportedAt: new Date().toISOString(),
    userId: state.userId,
    profile: state.user,
    preferences: state.preferences,
    matches: state.matches,
    likedProfileIds: state.likedIds,
    blockedProfileIds: state.blockedIds,
    notificationPreferences: state.notificationPreferences,
    privacyPreferences: state.privacyPreferences,
    legalConsent: state.legalConsent,
  };
}

export async function shareUserDataExport(
  payload: ExportableUserData,
  locale?: AppLocale | null,
): Promise<boolean> {
  const resolvedLocale = resolveAppLocale(locale);
  const json = JSON.stringify(payload, null, 2);
  const content = json.slice(0, 8000);
  const truncated =
    json.length > 8000 ? translate(resolvedLocale, 'privacy.exportTruncated') : '';
  const message =
    translate(resolvedLocale, 'privacy.exportShareBody', {
      date: payload.exportedAt,
      content,
    }) + truncated;

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `spark-export-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    return true;
  }

  await Share.share({
    message,
    title: translate(resolvedLocale, 'privacy.exportShareTitle'),
  });
  return true;
}
