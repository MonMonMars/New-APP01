import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './AnimatedPressable';

type MatchToastProps = {
  visible: boolean;
  profileName: string | null;
  onDismiss: () => void;
  /** Mini mode: quick flash so the disguise feed stays readable. */
  variant?: 'default' | 'mini';
};

const TOAST_TIMING = {
  default: { enterMs: 280, holdMs: 2600, exitMs: 240 },
  mini: { enterMs: 160, holdMs: 720, exitMs: 140 },
} as const;

export function MatchToast({ visible, profileName, onDismiss, variant = 'default' }: MatchToastProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const timing = TOAST_TIMING[variant];

  useEffect(() => {
    if (!visible || !profileName) {
      return;
    }

    translateY.value = withSequence(
      withTiming(0, { duration: timing.enterMs }),
      withDelay(timing.holdMs, withTiming(-120, { duration: timing.exitMs })),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: timing.enterMs }),
      withDelay(
        timing.holdMs,
        withTiming(0, { duration: timing.exitMs }, () => {
          runOnJS(onDismiss)();
        }),
      ),
    );
  }, [visible, profileName, onDismiss, opacity, timing.enterMs, timing.exitMs, timing.holdMs, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible || !profileName) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <AnimatedPressable style={[styles.toast, { borderColor: colors.gradientEnd }]} onPress={onDismiss}>
        <Text style={styles.emoji}>✨</Text>
        <View style={styles.textCol}>
          <Text style={styles.title}>New match!</Text>
          <Text style={styles.subtitle}>You and {profileName} liked each other</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.gradientEnd,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  emoji: {
    fontSize: 28,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
