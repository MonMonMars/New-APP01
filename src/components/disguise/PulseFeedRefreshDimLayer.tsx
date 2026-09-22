import { useEffect, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ensureWebMotionCss, webClass } from '../../motion/webMotion';

type PulseFeedRefreshDimLayerProps = {
  refreshing: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Instagram / YouTube style — desaturate feed content and block taps while Pulse reloads. */
export function PulseFeedRefreshDimLayer({
  refreshing,
  children,
  style,
}: PulseFeedRefreshDimLayerProps) {
  useEffect(() => {
    ensureWebMotionCss();
  }, []);

  return (
    <View style={[styles.root, style]}>
      <View
        style={[styles.content, refreshing ? styles.contentDimNative : null]}
        pointerEvents={refreshing ? 'none' : 'auto'}
        {...(Platform.OS === 'web' && refreshing ? webClass('spark-pulse-refresh-dim') : {})}
        importantForAccessibility={refreshing ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>
      {refreshing ? (
        <View
          style={styles.overlay}
          pointerEvents="auto"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  contentDimNative: {
    opacity: 0.52,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    top: 44,
    backgroundColor: Platform.OS === 'web' ? 'rgba(235, 235, 240, 0.42)' : 'rgba(210, 210, 218, 0.38)',
  },
});
