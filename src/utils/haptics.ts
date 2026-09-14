import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'none';

export function triggerHaptic(style: HapticStyle = 'light'): void {
  if (style === 'none' || Platform.OS === 'web') {
    return;
  }

  switch (style) {
    case 'light':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}
