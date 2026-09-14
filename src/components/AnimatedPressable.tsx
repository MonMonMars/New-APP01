import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { HapticStyle, triggerHaptic } from '../utils/haptics';

type AnimatedPressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  /** Scale on press-in (default 0.97). */
  scaleTo?: number;
  /** Opacity on press-in (default 0.88). */
  opacityTo?: number;
  haptic?: HapticStyle;
  children: ReactNode;
};

export const PRESS_SPRING = { damping: 16, stiffness: 380, mass: 0.6 };

export function AnimatedPressable({
  style,
  scaleTo = 0.97,
  opacityTo = 0.88,
  haptic = 'none',
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
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.45 : pressOpacity.value,
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(scaleTo, PRESS_SPRING);
          pressOpacity.value = withSpring(opacityTo, PRESS_SPRING);
          triggerHaptic(haptic);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, PRESS_SPRING);
        pressOpacity.value = withSpring(1, PRESS_SPRING);
        onPressOut?.(event);
      }}
      onPress={onPress}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
