import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SIZE = 28;
const STROKE = 2.5;

type PulseRefreshIndicatorProps = {
  /** 0–1 pull progress before refresh fires. */
  pullProgress: number;
  refreshing: boolean;
  color: string;
};

/** YouTube / Instagram style circular pull indicator at top of Pulse feeds. */
export function PulseRefreshIndicator({
  pullProgress,
  refreshing,
  color,
}: PulseRefreshIndicatorProps) {
  const spin = useSharedValue(0);
  const scale = useSharedValue(0.55);

  useEffect(() => {
    if (refreshing) {
      scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      spin.value = withRepeat(
        withTiming(360, { duration: 820, easing: Easing.linear }),
        -1,
        false,
      );
      return () => {
        cancelAnimation(spin);
      };
    }
    cancelAnimation(spin);
    spin.value = 0;
    const targetScale = 0.55 + Math.min(1, pullProgress) * 0.45;
    scale.value = withTiming(targetScale, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [pullProgress, refreshing, scale, spin]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${spin.value}deg` }],
    opacity: refreshing || pullProgress > 0.04 ? 1 : 0,
  }));

  const trackOpacity = refreshing ? 0.35 : 0.2 + pullProgress * 0.55;

  return (
    <Animated.View style={[styles.wrap, ringStyle]} accessibilityElementsHidden>
      <View style={[styles.track, { borderColor: color, opacity: trackOpacity }]} />
      <View
        style={[
          styles.arc,
          {
            borderTopColor: color,
            borderRightColor: refreshing ? color : 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
  },
  arc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
  },
});
