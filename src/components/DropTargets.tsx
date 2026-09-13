import { Ionicons } from '@expo/vector-icons';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { useRef } from 'react';
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
  onLayout: (event: LayoutChangeEvent) => void;
  onPress?: () => void;
};

function TargetButton({
  icon,
  color,
  active,
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
      <Animated.View style={[styles.target, animatedStyle]} onLayout={onLayout}>
        <Animated.View style={iconStyle}>
          <Ionicons name={icon} size={34} color={color} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export function DropTargets({
  trashActive,
  heartActive,
  onTrashLayout,
  onHeartLayout,
  onTrashPress,
  onHeartPress,
}: DropTargetsProps) {
  const rowLayoutRef = useRef({ x: 0, y: 0 });

  const toContainerLayout = (
    event: LayoutChangeEvent,
    callback: (layout: ZoneLayout) => void,
  ) => {
    const child = event.nativeEvent.layout;
    const row = rowLayoutRef.current;
    callback({
      x: row.x + child.x,
      y: row.y + child.y,
      width: child.width,
      height: child.height,
    });
  };

  return (
    <View
      style={styles.row}
      pointerEvents="box-none"
      onLayout={(event) => {
        rowLayoutRef.current = event.nativeEvent.layout;
      }}
    >
      <TargetButton
        icon="trash-outline"
        color={colors.nope}
        active={trashActive}
        onLayout={(event) => toContainerLayout(event, onTrashLayout)}
        onPress={onTrashPress}
      />
      <TargetButton
        icon="heart"
        color={colors.like}
        active={heartActive}
        onLayout={(event) => toContainerLayout(event, onHeartLayout)}
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
