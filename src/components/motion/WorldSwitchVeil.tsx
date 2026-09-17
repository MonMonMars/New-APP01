import { ReactNode, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { MOTION } from '../../motion/presets';
import { webClass } from '../../motion/webMotion';

type WorldSwitchVeilProps<T> = {
  activeKey: T;
  children: (shown: T) => ReactNode;
};

/** Brief fade veil when swapping Spark ↔ Pulse / Ember ↔ Harbor so the switch feels like a page change. */
export function WorldSwitchVeil<T>({ activeKey, children }: WorldSwitchVeilProps<T>) {
  const [shown, setShown] = useState(activeKey);
  const [veilOn, setVeilOn] = useState(false);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (activeKey === shown) {
      return;
    }

    setVeilOn(true);
    opacity.value = withTiming(1, { duration: MOTION.duration.fast });
    const swapAt = MOTION.duration.fast;
    const hideAt = swapAt + MOTION.duration.normal;

    const swapTimer = setTimeout(() => {
      setShown(activeKey);
      opacity.value = withTiming(0, { duration: MOTION.duration.normal });
    }, swapAt);
    const hideTimer = setTimeout(() => setVeilOn(false), hideAt);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(hideTimer);
    };
  }, [activeKey, opacity, shown]);

  const veilStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.root}>
      <View key={String(shown)} style={styles.page} {...webClass('spark-page-in')}>
        {children(shown)}
      </View>
      {veilOn ? (
        Platform.OS === 'web' ? (
          <View pointerEvents="none" style={styles.veil} {...webClass('spark-veil')} />
        ) : (
          <Animated.View pointerEvents="none" style={[styles.veil, veilStyle]} />
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  veil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F0F10',
    zIndex: 40,
  },
});
