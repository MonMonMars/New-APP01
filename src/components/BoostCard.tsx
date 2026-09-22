import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
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
  const { t } = useTranslation();
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
      return t('boost.topProfileRemaining', { time: formatRemaining(remaining) });
    }
    if (bonusBoosts > 0) {
      return bonusBoosts === 1
        ? t('boost.boostsReadyOne')
        : t('boost.boostsReadyMany', { count: bonusBoosts });
    }
    if (isSparkPlus && canUseFreeWeeklyBoost) {
      return t('boost.freeWeekly');
    }
    if (isSparkPlus) {
      return t('boost.weeklyUsed');
    }
    return t('boost.beSeen');
  })();

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="flash" size={24} color={colors.boost} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>
          {isActive ? t('boost.active') : t('boost.boostProfile')}
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
          <Text style={styles.buttonText}>{canActivate || !isSparkPlus ? t('profile.boost') : t('common.shop')}</Text>
        </AnimatedPressable>
      )}
      {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: colors.boost }]}>
          <Text style={styles.activeBadgeText}>{t('boost.live')}</Text>
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
