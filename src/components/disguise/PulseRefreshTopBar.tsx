import { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ensureWebMotionCss, webClass } from '../../motion/webMotion';

type PulseRefreshTopBarProps = {
  visible: boolean;
  color: string;
};

const TRACK_WIDTH = Dimensions.get('window').width;

/** Thin indeterminate bar (YouTube-style) while Pulse reloads. */
export function PulseRefreshTopBar({ visible, color }: PulseRefreshTopBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    ensureWebMotionCss();
  }, []);

  useEffect(() => {
    if (!visible) {
      progress.value = 0;
      return;
    }
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 720, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [progress, visible]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRACK_WIDTH * 0.85 }],
  }));

  if (!visible) {
    return null;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.track} pointerEvents="none" {...webClass('spark-pulse-top-bar-track')}>
        <View
          style={[styles.webFill, { backgroundColor: color }]}
          {...webClass('spark-pulse-top-bar-fill')}
        />
      </View>
    );
  }

  return (
    <View style={styles.track} pointerEvents="none">
      <Animated.View style={[styles.nativeFill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    overflow: 'hidden',
    zIndex: 40,
  },
  nativeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: TRACK_WIDTH * 0.36,
    borderRadius: 2,
    left: -TRACK_WIDTH * 0.36,
  },
  webFill: {
    height: '100%',
    width: '38%',
    borderRadius: 2,
  },
});
