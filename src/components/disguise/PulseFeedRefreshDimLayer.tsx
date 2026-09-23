import { useEffect, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { ensureWebMotionCss, webClass } from '../../motion/webMotion';
import { PulseRefreshTopBar } from './PulseRefreshTopBar';

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
  const accent = useDisguiseWorld().accent;
  const dim = useSharedValue(0);

  useEffect(() => {
    ensureWebMotionCss();
  }, []);

  useEffect(() => {
    dim.value = withTiming(refreshing ? 1 : 0, {
      duration: refreshing ? 220 : 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [dim, refreshing]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: dim.value * 0.42,
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - dim.value * 0.48,
    transform: [{ scale: 1 - dim.value * 0.012 }],
  }));

  return (
    <View style={[styles.root, style]}>
      <PulseRefreshTopBar visible={refreshing} color={accent} />
      <Animated.View
        style={[styles.content, contentAnimStyle]}
        pointerEvents={refreshing ? 'none' : 'auto'}
        {...(Platform.OS === 'web' && refreshing ? webClass('spark-pulse-refresh-dim') : {})}
        importantForAccessibility={refreshing ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </Animated.View>
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        pointerEvents={refreshing ? 'auto' : 'none'}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
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
  overlay: {
    ...StyleSheet.absoluteFill,
    top: 44,
    backgroundColor: Platform.OS === 'web' ? 'rgba(235, 235, 240, 0.55)' : 'rgba(210, 210, 218, 0.45)',
  },
});
