import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { AnimatedPressable } from '../AnimatedPressable';

const UNLOCK_RATIO = 0.82;
const TRACK_PADDING = 4;
const TRACK_WIDTH = 132;

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

type LogoBubbleProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  compact?: boolean;
};

/** Single bubble — icon fill + matching outline, no nested frames or extra marks. */
function LogoBubble({ icon, iconColor, iconBg, compact = false }: LogoBubbleProps) {
  const size = compact ? 40 : 44;

  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: iconBg,
          borderColor: `${iconColor}66`,
        },
      ]}
    >
      <Ionicons name={icon} size={compact ? 18 : 20} color={iconColor} />
    </View>
  );
}

/** Spark: tap logo for instant disguise. Pulse: drag logo right along track to unlock Spark. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  const { colors } = useTheme();
  const { disguiseMode, setDisguiseMode } = useApp();
  const [dragX, setDragX] = useState(0);
  const bubbleSize = compact ? 40 : 44;
  const maxDrag = Math.max(0, TRACK_WIDTH - bubbleSize - TRACK_PADDING * 2);

  const isPulse = variant === 'pulse';
  const icon = isPulse ? 'pulse' : 'flame';
  const iconColor = isPulse ? '#3b82f6' : colors.gradientEnd;
  const iconBg = isPulse ? 'rgba(59,130,246,0.22)' : 'rgba(255,107,107,0.2)';

  const enterDisguise = useCallback(() => {
    triggerHaptic('medium');
    void setDisguiseMode(true);
  }, [setDisguiseMode]);

  const exitDisguise = useCallback(() => {
    void setDisguiseMode(false).then((unlocked) => {
      if (unlocked) {
        triggerHaptic('success');
        setDragX(0);
      } else {
        dragXRef.current = 0;
        setDragX(0);
      }
    });
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

  const bubble = <LogoBubble icon={icon} iconColor={iconColor} iconBg={iconBg} compact={compact} />;

  if (!disguiseMode) {
    return (
      <AnimatedPressable
        onPress={enterDisguise}
        haptic="medium"
        scaleTo={0.94}
        accessibilityRole="button"
        accessibilityLabel={`Emergency — switch to ${DISGUISE_APP_NAME} disguise mode`}
        accessibilityHint="Tap instantly to hide Spark"
      >
        {bubble}
      </AnimatedPressable>
    );
  }

  const fillWidth = dragX + bubbleSize * 0.55;

  return (
    <View
      style={[
        styles.track,
        {
          width: TRACK_WIDTH,
          height: bubbleSize + TRACK_PADDING * 2,
          borderRadius: (bubbleSize + TRACK_PADDING * 2) / 2,
          backgroundColor: colors.surface,
        },
      ]}
      accessibilityRole="adjustable"
      accessibilityLabel="Drag right to unlock Spark"
    >
      <View
        style={[
          styles.trackFill,
          {
            width: fillWidth,
            backgroundColor: iconColor,
            borderRadius: (bubbleSize + TRACK_PADDING * 2) / 2,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: dragX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {bubble}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  track: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.2,
  },
  thumb: {
    position: 'absolute',
    left: TRACK_PADDING,
    zIndex: 2,
  },
});
