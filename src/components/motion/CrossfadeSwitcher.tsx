import { ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MOTION } from '../../motion/presets';

type CrossfadeSwitcherProps = {
  /** When true, shows the `on` panel; otherwise shows `off`. */
  active: boolean;
  onPanel: ReactNode;
  offPanel: ReactNode;
};

/** Crossfades between two full-screen panels (e.g. Spark ↔ Pulse disguise). */
export function CrossfadeSwitcher({ active, onPanel, offPanel }: CrossfadeSwitcherProps) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: MOTION.duration.slow });
  }, [active, progress]);

  const onStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.98 + progress.value * 0.02 }],
  }));

  const offStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 1 - progress.value * 0.02 }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View
        style={[styles.panel, offStyle]}
        pointerEvents={active ? 'none' : 'auto'}
      >
        {offPanel}
      </Animated.View>
      <Animated.View
        style={[styles.panel, onStyle]}
        pointerEvents={active ? 'auto' : 'none'}
      >
        {onPanel}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panel: {
    ...StyleSheet.absoluteFill,
  },
});
