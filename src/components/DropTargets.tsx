import { Ionicons } from '@expo/vector-icons';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { RefObject, useCallback, useRef } from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { colors, spacing } from '../theme';

export type ZoneLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DropTargetsProps = {
  containerRef: RefObject<View | null>;
  trashActive: SharedValue<number>;
  heartActive: SharedValue<number>;
  roseActive?: SharedValue<number>;
  compact?: boolean;
  onTrashLayout: (layout: ZoneLayout) => void;
  onHeartLayout: (layout: ZoneLayout) => void;
  onTrashPress?: () => void;
  onHeartPress?: () => void;
  onRosePress?: () => void;
};

const TARGET_SIZE = 68;
const TARGET_SIZE_COMPACT = 52;
const ROSE_SIZE = 52;
const ROSE_SIZE_COMPACT = 40;

type TargetButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  active: SharedValue<number>;
  targetRef: RefObject<View | null>;
  size?: number;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress?: () => void;
};

function TargetButton({
  icon,
  iconColor,
  backgroundColor,
  borderColor,
  active,
  targetRef,
  size = TARGET_SIZE,
  onLayout,
  onPress,
}: TargetButtonProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const intensity = active.value;
    return {
      transform: [{ scale: 1 + intensity * 0.22 }],
      borderColor,
      backgroundColor,
      shadowOpacity: 0.2 + intensity * 0.5,
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + active.value * 0.15,
    transform: [{ scale: 1 + active.value * 0.18 }],
  }));

  return (
    <Pressable onPress={onPress} hitSlop={16}>
      <Animated.View
        ref={targetRef}
        style={[styles.target, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}
        onLayout={onLayout}
      >
        <Animated.View style={iconStyle}>
          <Ionicons name={icon} size={size === ROSE_SIZE ? 26 : 34} color={iconColor} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export function DropTargets({
  containerRef,
  trashActive,
  heartActive,
  roseActive,
  compact = false,
  onTrashLayout,
  onHeartLayout,
  onTrashPress,
  onHeartPress,
  onRosePress,
}: DropTargetsProps) {
  const trashRef = useRef<View>(null);
  const heartRef = useRef<View>(null);
  const roseRef = useRef<View>(null);
  const roseActiveValue = roseActive ?? trashActive;
  const targetSize = compact ? TARGET_SIZE_COMPACT : TARGET_SIZE;
  const roseSize = compact ? ROSE_SIZE_COMPACT : ROSE_SIZE;

  const measureZone = useCallback(
    (targetRef: RefObject<View | null>, callback: (layout: ZoneLayout) => void) => {
      const container = containerRef.current;
      const target = targetRef.current;
      if (!container || !target) {
        return;
      }

      target.measureLayout(
        container,
        (x, y, width, height) => {
          callback({ x, y, width, height });
        },
        () => undefined,
      );
    },
    [containerRef],
  );

  const reportTrashZone = useCallback(() => {
    measureZone(trashRef, onTrashLayout);
  }, [measureZone, onTrashLayout]);

  const reportHeartZone = useCallback(() => {
    measureZone(heartRef, onHeartLayout);
  }, [measureZone, onHeartLayout]);

  const reportZones = useCallback(() => {
    reportTrashZone();
    reportHeartZone();
  }, [reportHeartZone, reportTrashZone]);

  return (
    <View style={[styles.row, compact && styles.rowCompact]} pointerEvents="box-none" onLayout={reportZones}>
      <TargetButton
        icon="trash-outline"
        iconColor={colors.textDark}
        backgroundColor={colors.card}
        borderColor="rgba(0,0,0,0.08)"
        active={trashActive}
        targetRef={trashRef}
        size={targetSize}
        onLayout={reportTrashZone}
        onPress={onTrashPress}
      />

      {onRosePress && (
        <TargetButton
          icon="rose"
          iconColor={colors.superLike}
          backgroundColor={colors.surface}
          borderColor={colors.superLike}
          active={roseActiveValue}
          targetRef={roseRef}
          size={roseSize}
          onLayout={() => undefined}
          onPress={onRosePress}
        />
      )}

      <TargetButton
        icon="heart"
        iconColor={colors.card}
        backgroundColor={colors.heartRed}
        borderColor={colors.heartRed}
        active={heartActive}
        targetRef={heartRef}
        size={targetSize}
        onLayout={reportHeartZone}
        onPress={onHeartPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  rowCompact: {
    bottom: spacing.sm,
    left: spacing.md,
    right: spacing.md,
  },
  target: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
