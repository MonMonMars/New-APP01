import { Ionicons } from '@expo/vector-icons';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { RefObject, useCallback, useRef } from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { PRESS_SPRING } from './AnimatedPressable';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

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
  /** Undo last pass — fourth action button, even spacing with pass / super like / like. */
  showRewind?: boolean;
  onRewindPress?: () => void;
  isSparkPlus?: boolean;
};

const TARGET_SIZE = 68;
const TARGET_SIZE_COMPACT = 52;
const STAR_SIZE = 58;
const STAR_SIZE_COMPACT = 44;
const REWIND_WHITE = '#ffffff';
const REWIND_BG = 'rgba(255, 255, 255, 0.22)';

type TargetButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  active: SharedValue<number>;
  targetRef: RefObject<View | null>;
  size?: number;
  accessibilityLabel?: string;
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
  accessibilityLabel,
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
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        pressScale.value = withSpring(0.88, PRESS_SPRING);
      }}
      onPressOut={() => {
        pressScale.value = withSequence(
          withSpring(1.08, PRESS_SPRING),
          withSpring(1, PRESS_SPRING),
        );
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
  showRewind = false,
  onRewindPress,
  isSparkPlus = true,
}: DropTargetsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const trashRef = useRef<View>(null);
  const heartRef = useRef<View>(null);
  const starRef = useRef<View>(null);
  const rewindRef = useRef<View>(null);
  const rewindActive = useSharedValue(0);
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
      <View style={styles.actionSlot}>
        <TargetButton
          icon="trash-outline"
          iconColor={colors.card}
          backgroundColor={colors.heartRed}
          borderColor={colors.heartRed}
          active={trashActive}
          targetRef={trashRef}
          size={targetSize}
          accessibilityLabel={t('discover.pass')}
          onLayout={reportTrashZone}
          onPress={onTrashPress}
        />
      </View>

      {onStarPress ? (
        <View style={styles.actionSlot}>
          <View style={styles.starWrap}>
            <View
              style={[
                styles.starGlow,
                {
                  width: starSize + 20,
                  height: starSize + 20,
                  borderRadius: (starSize + 20) / 2,
                  backgroundColor: `${colors.heartRed}40`,
                  borderColor: `${colors.heartPink}80`,
                },
              ]}
            />
            <TargetButton
              icon="star"
              iconColor={colors.card}
              backgroundColor={colors.heartRed}
              borderColor={colors.heartRed}
              active={starActiveValue}
              targetRef={starRef}
              size={starSize}
              accessibilityLabel={t('discover.superLike')}
              onLayout={reportStarZone}
              onPress={onStarPress}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.actionSlot}>
        <TargetButton
          icon="heart"
          iconColor={colors.card}
          backgroundColor={colors.heartRed}
          borderColor={colors.heartRed}
          active={heartActive}
          targetRef={heartRef}
          size={targetSize}
          accessibilityLabel={t('discover.like')}
          onLayout={reportHeartZone}
          onPress={onHeartPress}
        />
      </View>

      {showRewind && onRewindPress ? (
        <View style={styles.actionSlot}>
          <View style={styles.rewindWrap}>
            <TargetButton
              icon="arrow-undo"
              iconColor={REWIND_WHITE}
              backgroundColor={REWIND_BG}
              borderColor={REWIND_WHITE}
              active={rewindActive}
              targetRef={rewindRef}
              size={targetSize}
              accessibilityLabel={t('discover.rewindA11y')}
              onLayout={() => undefined}
              onPress={onRewindPress}
            />
            {!isSparkPlus ? (
              <View style={[styles.plusDot, { backgroundColor: colors.gradientEnd }]}>
                <Ionicons name="diamond" size={8} color={colors.text} />
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
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
    alignItems: 'center',
    zIndex: 20,
  },
  rowCompact: {
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  actionSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  rewindWrap: {
    position: 'relative',
  },
  plusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: REWIND_WHITE,
  },
  starWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlow: {
    position: 'absolute',
    borderWidth: 2,
  },
});
