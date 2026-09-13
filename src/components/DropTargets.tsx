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
  onTrashLayout: (layout: ZoneLayout) => void;
  onHeartLayout: (layout: ZoneLayout) => void;
  onTrashPress?: () => void;
  onHeartPress?: () => void;
};

const TARGET_SIZE = 68;

type TargetButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  active: SharedValue<number>;
  targetRef: RefObject<View | null>;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress?: () => void;
};

function TargetButton({
  icon,
  color,
  active,
  targetRef,
  onLayout,
  onPress,
}: TargetButtonProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const intensity = active.value;
    return {
      transform: [{ scale: 1 + intensity * 0.22 }],
      borderColor: color,
      backgroundColor: `rgba(26, 26, 28, ${0.85 + intensity * 0.15})`,
      shadowOpacity: 0.25 + intensity * 0.45,
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + active.value * 0.3,
    transform: [{ scale: 1 + active.value * 0.15 }],
  }));

  return (
    <Pressable onPress={onPress} hitSlop={16}>
      <Animated.View
        ref={targetRef}
        style={[styles.target, animatedStyle]}
        onLayout={onLayout}
      >
        <Animated.View style={iconStyle}>
          <Ionicons name={icon} size={34} color={color} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export function DropTargets({
  containerRef,
  trashActive,
  heartActive,
  onTrashLayout,
  onHeartLayout,
  onTrashPress,
  onHeartPress,
}: DropTargetsProps) {
  const trashRef = useRef<View>(null);
  const heartRef = useRef<View>(null);

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
    <View style={styles.row} pointerEvents="box-none" onLayout={reportZones}>
      <TargetButton
        icon="trash-outline"
        color={colors.nope}
        active={trashActive}
        targetRef={trashRef}
        onLayout={reportTrashZone}
        onPress={onTrashPress}
      />
      <TargetButton
        icon="heart"
        color={colors.like}
        active={heartActive}
        targetRef={heartRef}
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
    zIndex: 20,
  },
  target: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
