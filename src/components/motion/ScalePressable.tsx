import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
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

/** Pressable with spring scale, flash, release pop, and optional active-state pop. */
export function ScalePressable({
  onPress,
  children,
  style,
  active = false,
  accessibilityLabel,
  scaleTo = 0.88,
}: ScalePressableProps) {
  const pressScale = useSharedValue(1);
  const activePop = useSharedValue(1);
  const highlight = useSharedValue(0);

  useEffect(() => {
    activePop.value = withSpring(active ? 1.08 : 1, MOTION.spring.bounce);
  }, [active, activePop]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * activePop.value }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlight.value * 0.22,
  }));

  return (
    <AnimatedPressableBase
      onPress={onPress}
      hitSlop={12}
      onPressIn={() => {
        pressScale.value = withSpring(scaleTo, MOTION.spring.bounce);
        highlight.value = withTiming(1, { duration: 70 });
        if (Platform.OS !== 'web') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      onPressOut={() => {
        pressScale.value = withSequence(
          withSpring(1.08, MOTION.spring.bounce),
          withSpring(1, MOTION.spring.press),
        );
        highlight.value = withTiming(0, { duration: 240 });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.clip,
        style,
        animatedStyle,
        Platform.OS === 'web' ? { cursor: 'pointer' } : null,
      ]}
    >
      {children}
      <Animated.View pointerEvents="none" style={[styles.highlight, highlightStyle]} />
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
  size?: number;
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
  size = 40,
}: SparkIconButtonProps) {
  return (
    <ScalePressable
      onPress={onPress}
      active={active}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.iconBtn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
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
  clip: {
    overflow: 'hidden',
  },
  highlight: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#fff',
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 5,
  },
});
