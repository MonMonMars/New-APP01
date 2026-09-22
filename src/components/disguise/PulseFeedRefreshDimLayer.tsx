import { useEffect, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ensureWebMotionCss, webClass } from '../../motion/webMotion';

type PulseFeedRefreshDimLayerProps = {
  refreshing: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Subtle reload chrome — keep feed readable like Instagram / YouTube home refresh. */
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
    opacity: 0.88,
  },
});
