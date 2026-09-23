import { ReactNode, useEffect } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { MOTION, staggerDelay } from '../../motion/presets';
import { webClass } from '../../motion/webMotion';

type FadeSlideInProps = {
  children: ReactNode;
  /** Stagger index — multiplies by step delay. */
  index?: number;
  /** Extra delay in ms on top of stagger. */
  delay?: number;
  /** Distance to slide up from (px). */
  distance?: number;
  style?: StyleProp<ViewStyle>;
  /** Re-run enter animation when this changes. */
  replayKey?: string | number | boolean;
  /** Skip enter motion — use for Pulse feed first paint (Instagram-style instant cards). */
  instant?: boolean;
};

export function FadeSlideIn({
  children,
  index = 0,
  delay = 0,
  distance = 14,
  style,
  replayKey,
  instant = false,
}: FadeSlideInProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delay + staggerDelay(index),
      withSpring(1, MOTION.spring.gentle),
    );
  }, [delay, index, progress, replayKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }));

  // CSS enter on web — Reanimated mount springs can stick at opacity 0 and hide buttons.
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          style,
          instant ? undefined : ({ animationDelay: `${delay + staggerDelay(index)}ms` } as ViewStyle),
        ]}
        {...webClass(instant ? 'spark-pulse-feed-instant' : 'spark-fade-up')}
      >
        {children}
      </View>
    );
  }

  if (instant) {
    return <View style={style}>{children}</View>;
  }

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
