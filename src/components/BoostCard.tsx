import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './AnimatedPressable';

type BoostCardProps = {
  boostActiveUntil: string | null;
  isSparkPlus: boolean;
  bonusBoosts: number;
  canUseFreeWeeklyBoost: boolean;
  onActivate: () => void;
};

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function BoostCard({
  boostActiveUntil,
  isSparkPlus,
  bonusBoosts,
  canUseFreeWeeklyBoost,
  onActivate,
}: BoostCardProps) {
  const { colors } = useTheme();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!boostActiveUntil) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [boostActiveUntil]);

  const activeUntil = boostActiveUntil ? new Date(boostActiveUntil).getTime() : 0;
  const isActive = activeUntil > now;
  const remaining = isActive ? activeUntil - now : 0;
  const canActivate = canUseFreeWeeklyBoost || bonusBoosts > 0;

  const subtitle = (() => {
    if (isActive) {
      return `Top profile for ${formatRemaining(remaining)} remaining`;
    }
    if (bonusBoosts > 0) {
      return `${bonusBoosts} Boost${bonusBoosts === 1 ? '' : 's'} ready to use`;
    }
    if (isSparkPlus && canUseFreeWeeklyBoost) {
      return '1 free Boost per week with Spark+';
    }
    if (isSparkPlus) {
      return 'Free weekly Boost used — get more in Shop';
    }
    return 'Be seen by more people for 30 minutes';
  })();

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="flash" size={24} color={colors.boost} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>
          {isActive ? 'Boost active' : 'Boost your profile'}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {!isActive && (
        <AnimatedPressable
          style={[
            styles.button,
            { backgroundColor: colors.gradientEnd },
            !canActivate && !isSparkPlus && styles.buttonMuted,
          ]}
          onPress={onActivate}
        >
          <Text style={styles.buttonText}>{canActivate || !isSparkPlus ? 'Boost' : 'Shop'}</Text>
        </AnimatedPressable>
      )}
      {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: colors.boost }]}>
          <Text style={styles.activeBadgeText}>LIVE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  button: {
    backgroundColor: palette.gradientEnd,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonMuted: {
    opacity: 0.85,
  },
  buttonText: {
    color: palette.text,
    fontWeight: '800',
    fontSize: 14,
  },
  activeBadge: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  activeBadgeText: {
    color: palette.textDark,
    fontSize: 11,
    fontWeight: '900',
  },
});
