import { Ionicons } from '@expo/vector-icons';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
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
      transform: [{ scale: 1 + intensity * 0.18 }],
      borderColor: color,
      backgroundColor: `rgba(26, 26, 28, ${0.85 + intensity * 0.15})`,
      shadowOpacity: 0.25 + intensity * 0.35,
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + active.value * 0.3,
  }));

  return (
    <Pressable onPress={onPress} hitSlop={12}>
      <Animated.View style={[styles.target, animatedStyle]} onLayout={onLayout}>
        <Animated.View style={iconStyle}>
          <Ionicons name={icon} size={32} color={color} />
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
  const handleTrashLayout = (event: LayoutChangeEvent) => {
    onTrashLayout(event.nativeEvent.layout);
  };

  const handleHeartLayout = (event: LayoutChangeEvent) => {
    onHeartLayout(event.nativeEvent.layout);
  };

  return (
    <View style={styles.row} pointerEvents="box-none">
      <TargetButton
        icon="trash-outline"
        color={colors.nope}
        active={trashActive}
        onLayout={handleTrashLayout}
        onPress={onTrashPress}
      />
      <TargetButton
        icon="heart"
        color={colors.like}
        active={heartActive}
        onLayout={handleHeartLayout}
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
