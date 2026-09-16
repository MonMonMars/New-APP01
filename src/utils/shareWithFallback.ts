import { Alert, Platform, Share } from 'react-native';

/** Share text on native; on web fall back to clipboard + confirmation alert. */
export async function shareWithFallback(options: {
  message: string;
  title?: string;
  url?: string;
}): Promise<boolean> {
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
        Alert.alert('Link copied', 'Paste it anywhere to share Spark with friends.');
        return true;
      } catch {
        Alert.alert(options.title ?? 'Share', payload);
        return false;
      }
    }
    Alert.alert(options.title ?? 'Share', payload);
    return false;
  }
}
