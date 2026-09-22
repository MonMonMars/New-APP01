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
import { discoverActionRailHeight } from '../constants/discoverLayout';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

/** Tinder discovery bar (2025–2026): distinct button colors, left-to-right order. */
const TINDER_NOPE = '#FE3C72';
const TINDER_SUPER = '#21A8FF';
const TINDER_LIKE = '#4CCC93';
const TINDER_BOOST = '#A855F7';
const TINDER_REWIND_ICON = '#FFFFFF';
const TINDER_REWIND_BORDER = 'rgba(255, 255, 255, 0.55)';
const TINDER_REWIND_BG = 'rgba(255, 255, 255, 0.12)';
const TINDER_REWIND_MUTED = 'rgba(160, 160, 165, 0.45)';

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
  onRewindPress?: () => void;
  onBoostPress?: () => void;
  rewindEnabled?: boolean;
  isSparkPlus?: boolean;
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
  iconSize?: number;
  accessibilityLabel?: string;
  disabled?: boolean;
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
  iconSize,
  accessibilityLabel,
  disabled = false,
  onLayout,
  onPress,
}: TargetButtonProps) {
  const pressScale = useSharedValue(1);
  const resolvedIconSize = iconSize ?? (size <= STAR_SIZE_COMPACT ? 28 : size <= STAR_SIZE ? 28 : 34);

  const animatedStyle = useAnimatedStyle(() => {
    const intensity = active.value;
    return {
      transform: [{ scale: pressScale.value * (1 + intensity * 0.22) }],
      borderColor,
      backgroundColor,
      shadowOpacity: 0.2 + intensity * 0.5,
      opacity: disabled ? 0.42 : 1,
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + active.value * 0.15,
    transform: [{ scale: 1 + active.value * 0.18 }],
  }));

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={icon === 'flash' ? 2 : 6}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPressIn={() => {
        if (disabled) {
          return;
        }
        pressScale.value = withSpring(0.88, PRESS_SPRING);
      }}
      onPressOut={() => {
        if (disabled) {
          return;
        }
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
          <Ionicons name={icon} size={resolvedIconSize} color={iconColor} />
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
  onRewindPress,
  onBoostPress,
  rewindEnabled = false,
  isSparkPlus = true,
}: DropTargetsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const trashRef = useRef<View>(null);
  const heartRef = useRef<View>(null);
  const starRef = useRef<View>(null);
  const rewindRef = useRef<View>(null);
  const boostRef = useRef<View>(null);
  const rewindActive = useSharedValue(0);
  const boostActive = useSharedValue(0);
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

  const rewindIconColor = rewindEnabled ? TINDER_REWIND_ICON : TINDER_REWIND_MUTED;
  const rewindBorder = rewindEnabled ? TINDER_REWIND_BORDER : 'rgba(160, 160, 165, 0.35)';
  const rewindBg = rewindEnabled ? TINDER_REWIND_BG : 'rgba(255, 255, 255, 0.06)';

  const railHeight = discoverActionRailHeight(compact);

  return (
    <View
      style={[
        styles.row,
        compact && styles.rowCompact,
        { height: railHeight, maxHeight: railHeight },
      ]}
      pointerEvents="box-none"
      onLayout={reportZones}
    >
      <View style={styles.rewindWrap}>
        <TargetButton
          icon="arrow-undo"
          iconColor={rewindIconColor}
          backgroundColor={rewindBg}
          borderColor={rewindBorder}
          active={rewindActive}
          targetRef={rewindRef}
          size={targetSize}
          iconSize={compact ? 26 : 30}
          accessibilityLabel={t('discover.rewindA11y')}
          disabled={!onRewindPress}
          onLayout={() => undefined}
          onPress={onRewindPress}
        />
        {!isSparkPlus && onRewindPress ? (
          <View style={[styles.plusDot, { backgroundColor: colors.gradientEnd }]}>
            <Ionicons name="diamond" size={8} color={colors.text} />
          </View>
        ) : null}
      </View>

      <TargetButton
        icon="close"
        iconColor={colors.card}
        backgroundColor={TINDER_NOPE}
        borderColor={TINDER_NOPE}
        active={trashActive}
        targetRef={trashRef}
        size={targetSize}
        accessibilityLabel={t('discover.pass')}
        onLayout={reportTrashZone}
        onPress={onTrashPress}
      />

      {onStarPress ? (
        <View style={styles.starWrap}>
          <View
            pointerEvents="none"
            style={[
              styles.starGlow,
              {
                width: starSize + 16,
                height: starSize + 16,
                borderRadius: (starSize + 16) / 2,
                backgroundColor: `${TINDER_SUPER}33`,
                borderColor: `${TINDER_SUPER}88`,
              },
            ]}
          />
          <TargetButton
            icon="star"
            iconColor={colors.card}
            backgroundColor={TINDER_SUPER}
            borderColor={TINDER_SUPER}
            active={starActiveValue}
            targetRef={starRef}
            size={starSize}
            accessibilityLabel={t('discover.superLike')}
            onLayout={reportStarZone}
            onPress={onStarPress}
          />
        </View>
      ) : null}

      <TargetButton
        icon="heart"
        iconColor={colors.card}
        backgroundColor={TINDER_LIKE}
        borderColor={TINDER_LIKE}
        active={heartActive}
        targetRef={heartRef}
        size={targetSize}
        accessibilityLabel={t('discover.like')}
        onLayout={reportHeartZone}
        onPress={onHeartPress}
      />

      <TargetButton
        icon="flash"
        iconColor={colors.card}
        backgroundColor={TINDER_BOOST}
        borderColor={TINDER_BOOST}
        active={boostActive}
        targetRef={boostRef}
        size={targetSize}
        iconSize={compact ? 26 : 30}
        accessibilityLabel={t('profile.boost')}
        disabled={!onBoostPress}
        onLayout={() => undefined}
        onPress={onBoostPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    bottom: 0,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    zIndex: 20,
  },
  rowCompact: {
    left: spacing.xs,
    right: spacing.xs,
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
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TINDER_REWIND_BORDER,
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
