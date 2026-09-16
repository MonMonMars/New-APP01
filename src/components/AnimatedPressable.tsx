import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type AnimatedPressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  /** Scale on press-in (default 0.93). */
  scaleTo?: number;
  /** Opacity on press-in (default 0.92). */
  opacityTo?: number;
  /** Overshoot on press-out (default true). */
  popOnRelease?: boolean;
  /** White flash overlay while pressed (default true). */
  flash?: boolean;
  children?: ReactNode;
};

export const PRESS_SPRING = { damping: 11, stiffness: 540, mass: 0.4 };
const RELEASE_POP_SPRING = { damping: 8, stiffness: 580, mass: 0.36 };
const SETTLE_SPRING = { damping: 13, stiffness: 400, mass: 0.48 };

const PRESS_IN_MS = 80;
const PRESS_OUT_MS = 160;

/** Pressable with scale + flash + release pop — style on the pressable for correct web hit targets. */
const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({
  style,
  scaleTo = 0.93,
  opacityTo = 0.92,
  popOnRelease = true,
  flash = true,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);
  const highlight = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: (1 - pressOpacity.value) * 3 },
    ],
    opacity: disabled ? 0.45 : 0.86 + pressOpacity.value * 0.14,
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlight.value * 0.2,
  }));

  return (
    <AnimatedPressableBase
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(scaleTo, PRESS_SPRING);
          pressOpacity.value = withTiming(opacityTo, { duration: PRESS_IN_MS });
          if (flash) {
            highlight.value = withTiming(1, { duration: 70 });
          }
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = popOnRelease
          ? withSequence(withSpring(1.05, RELEASE_POP_SPRING), withSpring(1, SETTLE_SPRING))
          : withSpring(1, SETTLE_SPRING);
        pressOpacity.value = withTiming(1, { duration: PRESS_OUT_MS });
        highlight.value = withTiming(0, { duration: 260 });
        onPressOut?.(event);
      }}
      onPress={onPress}
      style={[
        styles.clip,
        style,
        animatedStyle,
        Platform.OS === 'web' ? { cursor: disabled ? 'default' : 'pointer' } : null,
      ]}
      {...rest}
    >
      {children}
      <Animated.View pointerEvents="none" style={[styles.highlight, highlightStyle]} />
    </AnimatedPressableBase>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  highlight: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#fff',
  },
});
