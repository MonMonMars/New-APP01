import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { spacing } from '../../theme';

const UNLOCK_DRAG_THRESHOLD = 72;

type ModeToggleLogoProps = {
  variant: 'pulse' | 'spark';
  title?: string;
  compact?: boolean;
};

function triggerHaptic(style: 'light' | 'medium' | 'success' = 'medium') {
  if (Platform.OS === 'web') {
    return;
  }
  if (style === 'success') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }
  void Haptics.impactAsync(
    style === 'light' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
  );
}

/** Spark: tap logo for instant disguise. Pulse: hold and drag right to unlock Spark. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  const { colors } = useTheme();
  const { disguiseMode, setDisguiseMode } = useApp();
  const [unlockHint, setUnlockHint] = useState(false);

  const isPulse = variant === 'pulse';
  const icon = isPulse ? 'pulse' : 'flame';
  const iconColor = isPulse ? '#3b82f6' : colors.gradientEnd;
  const iconBg = isPulse ? 'rgba(59,130,246,0.15)' : 'rgba(255,107,107,0.14)';

  const enterDisguise = useCallback(() => {
    triggerHaptic('medium');
    setDisguiseMode(true);
  }, [setDisguiseMode]);

  const exitDisguise = useCallback(() => {
    triggerHaptic('success');
    setDisguiseMode(false);
    setUnlockHint(false);
  }, [setDisguiseMode]);

  const dragX = useSharedValue(0);
  const holding = useSharedValue(false);
  const zoneOpacity = useSharedValue(disguiseMode ? 0 : 0.42);

  const longPress = Gesture.LongPress()
    .minDuration(180)
    .onStart(() => {
      holding.value = true;
      runOnJS(setUnlockHint)(true);
      runOnJS(triggerHaptic)('light');
    })
    .onFinalize(() => {
      holding.value = false;
      dragX.value = withSpring(0);
      runOnJS(setUnlockHint)(false);
    });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (!holding.value) {
        return;
      }
      dragX.value = Math.max(0, Math.min(event.translationX, 120));
    })
    .onEnd(() => {
      if (dragX.value >= UNLOCK_DRAG_THRESHOLD) {
        runOnJS(exitDisguise)();
      }
      holding.value = false;
      dragX.value = withSpring(0);
      runOnJS(setUnlockHint)(false);
    });

  const unlockGesture = Gesture.Simultaneous(longPress, pan);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  const trackFillStyle = useAnimatedStyle(() => ({
    width: dragX.value,
    opacity: holding.value ? 0.9 : 0.35,
  }));

  const emergencyZoneStyle = useAnimatedStyle(() => ({
    opacity: zoneOpacity.value,
  }));

  const handleEmergencyPress = () => {
    zoneOpacity.value = withTiming(0.65, { duration: 80 }, () => {
      zoneOpacity.value = withTiming(0.42, { duration: 200 });
    });
    enterDisguise();
  };

  if (!disguiseMode) {
    return (
      <Pressable
        onPress={handleEmergencyPress}
        style={styles.emergencyWrap}
        accessibilityRole="button"
        accessibilityLabel={`Emergency — switch to ${DISGUISE_APP_NAME} disguise mode`}
        accessibilityHint="Tap instantly to hide Spark"
      >
        <Animated.View style={[styles.emergencyZone, emergencyZoneStyle]} pointerEvents="none" />
        <View style={[styles.logoIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={compact ? 18 : 20} color={iconColor} />
        </View>
        <Text style={[styles.emergencyLabel, { color: colors.textMuted }]}>Emergency</Text>
      </Pressable>
    );
  }

  return (
    <GestureDetector gesture={unlockGesture}>
      <View
        style={styles.unlockWrap}
        accessibilityRole="button"
        accessibilityLabel="Hold and drag right to unlock Spark"
        accessibilityHint="Keeps disguise mode until you deliberately unlock"
      >
        <View style={[styles.unlockTrack, { borderColor: colors.border }]}>
          <Animated.View style={[styles.unlockFill, { backgroundColor: colors.gradientEnd }, trackFillStyle]} />
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.unlockChevron} />
        </View>
        <Animated.View style={[styles.logoIcon, { backgroundColor: iconBg }, logoAnimatedStyle]}>
          <Ionicons name={icon} size={compact ? 18 : 20} color={iconColor} />
        </Animated.View>
        {unlockHint ? (
          <Text style={[styles.unlockHint, { color: colors.gradientEnd }]}>Drag →</Text>
        ) : (
          <Text style={[styles.holdHint, { color: colors.textMuted }]}>Hold & drag</Text>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  emergencyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 72,
    minHeight: 56,
  },
  emergencyZone: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  emergencyLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  unlockWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  unlockTrack: {
    width: 88,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  unlockFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 18,
    opacity: 0.35,
  },
  unlockChevron: {
    position: 'absolute',
    right: 8,
  },
  holdHint: {
    fontSize: 10,
    fontWeight: '700',
  },
  unlockHint: {
    fontSize: 11,
    fontWeight: '800',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
