import { useEffect, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ensureWebMotionCss, webClass } from '../../motion/webMotion';
import { PulseFeedRefreshTopChrome } from './PulseFeedRefreshTopChrome';

type PulseFeedRefreshDimLayerProps = {
  refreshing: boolean;
  pullOffset?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Instagram / YouTube — grey wash + blocked taps while Pulse reloads. */
export function PulseFeedRefreshDimLayer({
  refreshing,
  pullOffset = 0,
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
          testID="pulse-feed-refresh-dim-overlay"
        />
      ) : null}
      <PulseFeedRefreshTopChrome visible={refreshing} pullOffset={pullOffset} />
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
    opacity: 0.48,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 8,
    backgroundColor: Platform.OS === 'web' ? 'rgba(228, 228, 234, 0.62)' : 'rgba(210, 210, 218, 0.52)',
  },
});
