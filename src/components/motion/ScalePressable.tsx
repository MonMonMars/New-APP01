import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { MOTION } from '../../motion/presets';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type ScalePressableProps = {
  onPress?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
  accessibilityLabel?: string;
  scaleTo?: number;
};

/** Pressable with spring scale + optional active-state pop. */
export function ScalePressable({
  onPress,
  children,
  style,
  active = false,
  accessibilityLabel,
  scaleTo = 0.9,
}: ScalePressableProps) {
  const pressScale = useSharedValue(1);
  const activePop = useSharedValue(1);

  useEffect(() => {
    activePop.value = withSpring(active ? 1.06 : 1, MOTION.spring.bounce);
  }, [active, activePop]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * activePop.value }],
  }));

  return (
    <AnimatedPressableBase
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withSpring(scaleTo, MOTION.spring.press);
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, MOTION.spring.press);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressableBase>
  );
}

type SparkIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconSize: number;
  color: string;
  active: boolean;
  activeBackground: string;
  activeBorder: string;
  idleBackground: string;
  idleBorder: string;
  onPress: () => void;
  accessibilityLabel: string;
};

export function SparkIconButton({
  icon,
  iconSize,
  color,
  active,
  activeBackground,
  activeBorder,
  idleBackground,
  idleBorder,
  onPress,
  accessibilityLabel,
}: SparkIconButtonProps) {
  return (
    <ScalePressable
      onPress={onPress}
      active={active}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.iconBtn,
        {
          backgroundColor: active ? activeBackground : idleBackground,
          borderColor: active ? activeBorder : idleBorder,
        },
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={color} />
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
