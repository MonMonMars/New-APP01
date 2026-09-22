import { Alert, Platform, Share } from 'react-native';

import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';

/** Share text on native; on web fall back to clipboard + confirmation alert. */
export async function shareWithFallback(options: {
  message: string;
  title?: string;
  url?: string;
  locale?: AppLocale | null;
}): Promise<boolean> {
  const locale = resolveAppLocale(options.locale);
  const payload = options.url ? `${options.message}\n${options.url}` : options.message;

  try {
    const result = await Share.share({
      message: payload,
      title: options.title,
      url: options.url,
    });
    if (result.action === Share.dismissedAction) {
      return false;
    }
    return true;
  } catch {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(payload);
        Alert.alert(
          translate(locale, 'utils.linkCopiedTitle'),
          translate(locale, 'utils.linkCopiedBody'),
        );
        return true;
      } catch {
        Alert.alert(
          options.title ?? translate(locale, 'utils.shareDefaultTitle'),
          payload,
        );
        return false;
      }
    }
    Alert.alert(options.title ?? translate(locale, 'utils.shareDefaultTitle'), payload);
    return false;
  }
}
