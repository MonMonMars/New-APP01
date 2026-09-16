import type { ReactNode } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type AnimatedPressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  /** Scale on press-in (default 0.96). */
  scaleTo?: number;
  /** Opacity on press-in (default 0.86). */
  opacityTo?: number;
  children?: ReactNode;
};

export const PRESS_SPRING = { damping: 15, stiffness: 420, mass: 0.55 };

const PRESS_IN_MS = 110;
const PRESS_OUT_MS = 180;

/** Pressable with scale + opacity transition — style on the pressable for correct web hit targets. */
const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({
  style,
  scaleTo = 0.96,
  opacityTo = 0.86,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: (1 - pressOpacity.value) * 2 },
    ],
    opacity: disabled ? 0.45 : 0.72 + pressOpacity.value * 0.28,
  }));

  return (
    <AnimatedPressableBase
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(scaleTo, PRESS_SPRING);
          pressOpacity.value = withTiming(opacityTo, { duration: PRESS_IN_MS });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, PRESS_SPRING);
        pressOpacity.value = withTiming(1, { duration: PRESS_OUT_MS });
        onPressOut?.(event);
      }}
      onPress={onPress}
      style={[
        style,
        animatedStyle,
        Platform.OS === 'web' ? { cursor: disabled ? 'default' : 'pointer' } : null,
      ]}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
}
