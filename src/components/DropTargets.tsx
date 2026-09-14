import { Ionicons } from '@expo/vector-icons';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { RefObject, useCallback, useRef } from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  starActive?: SharedValue<number>;
  compact?: boolean;
  onTrashLayout: (layout: ZoneLayout) => void;
  onHeartLayout: (layout: ZoneLayout) => void;
  onStarLayout?: (layout: ZoneLayout) => void;
  onTrashPress?: () => void;
  onHeartPress?: () => void;
  onStarPress?: () => void;
};

const TARGET_SIZE = 68;
const TARGET_SIZE_COMPACT = 52;
const STAR_SIZE = 58;
const STAR_SIZE_COMPACT = 44;

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
  const pressScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    const intensity = active.value;
    return {
      transform: [{ scale: pressScale.value * (1 + intensity * 0.22) }],
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
    <Pressable
      onPress={onPress}
      hitSlop={16}
      onPressIn={() => {
        pressScale.value = withSpring(0.9, { damping: 14, stiffness: 420 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 14, stiffness: 420 });
      }}
    >
      <Animated.View
        ref={targetRef}
        style={[styles.target, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}
        onLayout={onLayout}
      >
        <Animated.View style={iconStyle}>
          <Ionicons name={icon} size={size === STAR_SIZE || size === STAR_SIZE_COMPACT ? 28 : 34} color={iconColor} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export function DropTargets({
  containerRef,
  trashActive,
  heartActive,
  starActive,
  compact = false,
  onTrashLayout,
  onHeartLayout,
  onStarLayout,
  onTrashPress,
  onHeartPress,
  onStarPress,
}: DropTargetsProps) {
  const trashRef = useRef<View>(null);
  const heartRef = useRef<View>(null);
  const starRef = useRef<View>(null);
  const starActiveValue = starActive ?? trashActive;
  const targetSize = compact ? TARGET_SIZE_COMPACT : TARGET_SIZE;
  const starSize = compact ? STAR_SIZE_COMPACT : STAR_SIZE;

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

  const reportStarZone = useCallback(() => {
    if (onStarLayout) {
      measureZone(starRef, onStarLayout);
    }
  }, [measureZone, onStarLayout]);

  const reportZones = useCallback(() => {
    reportTrashZone();
    reportHeartZone();
    reportStarZone();
  }, [reportHeartZone, reportStarZone, reportTrashZone]);

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

      {onStarPress && (
        <View style={styles.starWrap}>
          <View style={[styles.starGlow, { width: starSize + 20, height: starSize + 20, borderRadius: (starSize + 20) / 2 }]} />
          <TargetButton
            icon="star"
            iconColor={colors.card}
            backgroundColor={colors.heartRed}
            borderColor={colors.heartRed}
            active={starActiveValue}
            targetRef={starRef}
            size={starSize}
            onLayout={reportStarZone}
            onPress={onStarPress}
          />
        </View>
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
    bottom: spacing.md,
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
  starWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(233,64,87,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,107,138,0.5)',
  },
});
