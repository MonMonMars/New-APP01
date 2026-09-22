import { Alert, Linking, Platform } from 'react-native';

import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';

/** Open a real external URL (news article, client ad landing page). */
export async function openExternalUrl(
  url: string,
  label?: string,
  locale?: AppLocale | null,
): Promise<void> {
  const resolvedLocale = resolveAppLocale(locale);
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) {
    return;
  }

  try {
    const canOpen = await Linking.canOpenURL(trimmed);
    if (!canOpen) {
      if (Platform.OS === 'web') {
        window.open(trimmed, '_blank', 'noopener,noreferrer');
        return;
      }
      Alert.alert(translate(resolvedLocale, 'utils.cannotOpenLink'), label ?? trimmed);
      return;
    }
    await Linking.openURL(trimmed);
  } catch {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(trimmed, '_blank', 'noopener,noreferrer');
      return;
    }
    Alert.alert(
      translate(resolvedLocale, 'utils.linkFailed'),
      label ?? translate(resolvedLocale, 'utils.tryAgainLater'),
    );
  }
}
