import { Alert, Linking, Platform } from 'react-native';

/** Open a real external URL (news article, client ad landing page). */
export async function openExternalUrl(url: string, label?: string): Promise<void> {
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
      Alert.alert('Cannot open link', label ?? trimmed);
      return;
    }
    await Linking.openURL(trimmed);
  } catch {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(trimmed, '_blank', 'noopener,noreferrer');
      return;
    }
    Alert.alert('Link failed', label ?? 'Please try again later.');
  }
}
