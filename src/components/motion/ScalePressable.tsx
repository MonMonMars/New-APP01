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
import { webClass } from '../../motion/webMotion';

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
  const burst = useSharedValue(0);

  useEffect(() => {
    activePop.value = withSpring(active ? 1.08 : 1, MOTION.spring.bounce);
  }, [active, activePop]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * activePop.value }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlight.value * 0.22,
  }));

  const burstStyle = useAnimatedStyle(() => ({
    opacity: (1 - burst.value) * 0.5,
    transform: [{ scale: 0.72 + burst.value * 0.55 }],
  }));

  return (
    <AnimatedPressableBase
      onPress={onPress}
      hitSlop={12}
      onPressIn={() => {
        pressScale.value = withSpring(scaleTo, MOTION.spring.bounce);
        highlight.value = withTiming(1, { duration: 70 });
        burst.value = 0;
        burst.value = withTiming(1, { duration: 280 });
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
      {...webClass('spark-press')}
    >
      {children}
      <Animated.View pointerEvents="none" style={[styles.burst, burstStyle]} />
      <Animated.View pointerEvents="none" style={[styles.highlight, highlightStyle]} />
    </AnimatedPressableBase>
  );
}

export type SparkIconShape = 'circle' | 'squircle' | 'diamond' | 'hex' | 'pill';

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
  /** Circle is dating-coded; Pulse uses squircle / diamond / hex / pill so the cover stays news-like. */
  shape?: SparkIconShape;
};

function shapeFrame(shape: SparkIconShape, size: number): ViewStyle {
  switch (shape) {
    case 'circle':
      return { width: size, height: size, borderRadius: size / 2 };
    case 'squircle':
      return { width: size, height: size, borderRadius: 10 };
    case 'diamond':
      return {
        width: size,
        height: size,
        borderRadius: 4,
        ...(Platform.OS === 'web'
          ? ({ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } as ViewStyle)
          : { transform: [{ rotate: '45deg' }] }),
      };
    case 'hex':
      return {
        width: size,
        height: size,
        borderRadius: Platform.OS === 'web' ? 0 : 8,
        ...(Platform.OS === 'web'
          ? ({ clipPath: 'polygon(50% 4%, 90% 25%, 90% 75%, 50% 96%, 10% 75%, 10% 25%)' } as ViewStyle)
          : {}),
      };
    case 'pill':
      return { width: size + 8, height: size - 2, borderRadius: size };
    default: {
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}

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
  shape = 'circle',
}: SparkIconButtonProps) {
  const frame = shapeFrame(shape, size);
  const rotateIconBack = shape === 'diamond' && Platform.OS !== 'web';

  return (
    <ScalePressable
      onPress={onPress}
      active={active}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.iconBtn,
        frame,
        {
          backgroundColor: active ? activeBackground : idleBackground,
          borderColor: active ? activeBorder : idleBorder,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={iconSize}
        color={color}
        style={rotateIconBack ? { transform: [{ rotate: '-45deg' }] } : undefined}
      />
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
  burst: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 5,
  },
});
