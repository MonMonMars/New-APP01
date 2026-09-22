import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { spacing } from '../../theme';

export type MiniDismissKind = 'like' | 'unlike' | 'super' | 'pass';

type DisguiseMiniDismissStatProps = {
  kind: MiniDismissKind;
};

function ringAccentForKind(
  kind: MiniDismissKind,
  colors: { heartRed: string; superLike: string; textMuted: string },
): string {
  switch (kind) {
    case 'like':
      return colors.heartRed;
    case 'super':
      return colors.superLike;
    case 'unlike':
    case 'pass':
      return colors.textMuted;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

const STAT_META: Record<
  MiniDismissKind,
  { icon: keyof typeof Ionicons.glyphMap; labelKey: `disguiseMiniDismiss.${MiniDismissKind}`; iconColorKey: 'heartRed' | 'textMuted' | 'superLike' }
> = {
  like: { icon: 'heart', labelKey: 'disguiseMiniDismiss.like', iconColorKey: 'heartRed' },
  unlike: { icon: 'heart-dislike-outline', labelKey: 'disguiseMiniDismiss.unlike', iconColorKey: 'textMuted' },
  super: { icon: 'star', labelKey: 'disguiseMiniDismiss.super', iconColorKey: 'superLike' },
  pass: { icon: 'trash-outline', labelKey: 'disguiseMiniDismiss.pass', iconColorKey: 'textMuted' },
};

/** Brief pulse + icon flash while the mini window fades out after a Spark action. */
export function DisguiseMiniDismissStat({ kind }: DisguiseMiniDismissStatProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const meta = STAT_META[kind];
  const iconColor = colors[meta.iconColorKey];
  const label = t(meta.labelKey);
  const ringAccent = ringAccentForKind(kind, colors);

  const ringScale = useSharedValue(0.45);
  const ringOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.72);
  const badgeOpacity = useSharedValue(0);
  const labelOpacity = useSharedValue(0);

  useEffect(() => {
    ringScale.value = 0.45;
    ringOpacity.value = 0.85;
    ringScale.value = withTiming(2.2, { duration: 260, easing: Easing.out(Easing.cubic) });
    ringOpacity.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });

    badgeScale.value = 0.72;
    badgeOpacity.value = 0;
    badgeScale.value = withSequence(
      withTiming(1.08, { duration: 110, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1, { duration: 80 }),
      withDelay(40, withTiming(0.88, { duration: 120 })),
    );
    badgeOpacity.value = withSequence(
      withTiming(1, { duration: 90 }),
      withDelay(100, withTiming(0, { duration: 130 })),
    );

    labelOpacity.value = withSequence(
      withDelay(40, withTiming(1, { duration: 100 })),
      withDelay(90, withTiming(0, { duration: 120 })),
    );
  }, [badgeOpacity, badgeScale, kind, labelOpacity, ringOpacity, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  return (
    <View
      style={styles.overlay}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.ring, { borderColor: ringAccent }, ringStyle]} />
      <Animated.View style={[styles.badge, { backgroundColor: colors.surface, borderColor: ringAccent }, badgeStyle]}>
        <Ionicons name={meta.icon} size={kind === 'super' ? 22 : 20} color={iconColor} />
      </Animated.View>
      <Animated.Text style={[styles.label, { color: colors.text }, labelStyle]}>{label}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  label: {
    position: 'absolute',
    bottom: spacing.sm,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
