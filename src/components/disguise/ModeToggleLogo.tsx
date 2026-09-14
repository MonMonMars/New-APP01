import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
const THUMB_SIZE = 40;
const TRACK_HEIGHT = 44;
const UNLOCK_RATIO = 0.82;

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

/** Spark: tap logo for instant disguise. Pulse: drag logo right along track to unlock Spark. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  const { colors } = useTheme();
  const { disguiseMode, setDisguiseMode } = useApp();
  const [dragX, setDragX] = useState(0);
  const [trackWidth, setTrackWidth] = useState(148);
  const maxDrag = Math.max(0, trackWidth - THUMB_SIZE - 8);

  const isPulse = variant === 'pulse';
  const icon = isPulse ? 'pulse' : 'flame';
  const iconColor = isPulse ? '#3b82f6' : colors.gradientEnd;
  const iconBg = isPulse ? 'rgba(59,130,246,0.22)' : 'rgba(255,107,107,0.2)';

  const enterDisguise = useCallback(() => {
    triggerHaptic('medium');
    setDisguiseMode(true);
  }, [setDisguiseMode]);

  const exitDisguise = useCallback(() => {
    triggerHaptic('success');
    setDisguiseMode(false);
    setDragX(0);
  }, [setDisguiseMode]);

  const dragXRef = useRef(0);
  const maxDragRef = useRef(maxDrag);

  dragXRef.current = dragX;
  maxDragRef.current = maxDrag;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 2,
      onPanResponderGrant: () => {
        triggerHaptic('light');
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.max(0, Math.min(gesture.dx, maxDragRef.current));
        dragXRef.current = next;
        setDragX(next);
      },
      onPanResponderRelease: () => {
        const threshold = maxDragRef.current * UNLOCK_RATIO;
        if (dragXRef.current >= threshold) {
          exitDisguise();
          return;
        }
        dragXRef.current = 0;
        setDragX(0);
      },
      onPanResponderTerminate: () => {
        dragXRef.current = 0;
        setDragX(0);
      },
    }),
  ).current;

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0) {
      setTrackWidth(width);
    }
  };

  if (!disguiseMode) {
    return (
      <Pressable
        onPress={enterDisguise}
        style={({ pressed }) => [
          styles.emergencyButton,
          { backgroundColor: pressed ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.2)' },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Emergency — switch to ${DISGUISE_APP_NAME} disguise mode`}
        accessibilityHint="Tap instantly to hide Spark"
      >
        <View style={[styles.logoIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={compact ? 18 : 20} color={iconColor} />
        </View>
        <View style={styles.emergencyBadge}>
          <Ionicons name="shield" size={10} color="#fff" />
        </View>
      </Pressable>
    );
  }

  const fillWidth = dragX + THUMB_SIZE * 0.5;

  return (
    <View
      style={[styles.track, { borderColor: colors.border, backgroundColor: colors.surface }]}
      onLayout={onTrackLayout}
      accessibilityRole="adjustable"
      accessibilityLabel="Drag right to unlock Spark"
    >
      <View
        style={[
          styles.trackFill,
          {
            width: fillWidth,
            backgroundColor: colors.gradientEnd,
          },
        ]}
      />
      <View style={styles.trackArrows} pointerEvents="none">
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.arrowMid} />
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
      <View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: dragX }],
            backgroundColor: iconBg,
            borderColor: colors.border,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name={icon} size={compact ? 18 : 20} color={iconColor} />
        <View style={styles.thumbGrip}>
          <View style={[styles.gripLine, { backgroundColor: colors.textMuted }]} />
          <View style={[styles.gripLine, { backgroundColor: colors.textMuted }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emergencyButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  emergencyBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: 148,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.28,
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackArrows: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.55,
  },
  arrowMid: {
    marginHorizontal: -6,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE - 4,
    borderRadius: (THUMB_SIZE - 4) / 2,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
    zIndex: 2,
  },
  thumbGrip: {
    gap: 2,
    opacity: 0.65,
  },
  gripLine: {
    width: 2,
    height: 8,
    borderRadius: 1,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
