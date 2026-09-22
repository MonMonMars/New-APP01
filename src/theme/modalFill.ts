import { Platform, StyleSheet, type ViewStyle } from 'react-native';

/**
 * Transparent RN-web Modals often give `flex: 1` no height, so sheets
 * collapse or sit off-screen. Fill the viewport instead.
 */
export const modalFill = {
  ...StyleSheet.absoluteFill,
  ...(Platform.OS === 'web'
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }
    : null),
} as ViewStyle;
