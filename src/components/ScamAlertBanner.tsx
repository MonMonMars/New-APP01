import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { spacing } from '../theme';
import type { ScamRiskLevel } from '../trust/scamTypes';

type Props = {
  riskLevel: ScamRiskLevel;
  onLearnMore?: () => void;
  onReport?: () => void;
  compact?: boolean;
};

export function ScamAlertBanner({ riskLevel, onLearnMore, onReport, compact }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (riskLevel === 'low') {
    return null;
  }

  const isCritical = riskLevel === 'critical';
  const titleKey =
    riskLevel === 'critical'
      ? 'scamProtection.bannerCriticalTitle'
      : riskLevel === 'high'
        ? 'scamProtection.bannerHighTitle'
        : 'scamProtection.bannerMediumTitle';

  const accent = isCritical ? '#E74C3C' : '#F5A623';

  return (
    <Pressable
      style={[
        styles.wrap,
        { backgroundColor: `${accent}22`, borderColor: `${accent}88` },
        compact && styles.wrapCompact,
      ]}
      onPress={onLearnMore}
      disabled={!onLearnMore}
      accessibilityRole="button"
      accessibilityLabel={t(titleKey)}
    >
      <Ionicons name={isCritical ? 'shield' : 'warning'} size={compact ? 18 : 22} color={accent} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: accent }]}>{t(titleKey)}</Text>
        {!compact ? (
          <Text style={[styles.body, { color: colors.textMuted }]}>{t('scamProtection.bannerBody')}</Text>
        ) : null}
        {onLearnMore ? (
          <Text style={[styles.link, { color: colors.gradientEnd }]}>{t('scamProtection.learnProtection')}</Text>
        ) : null}
        {onReport ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onReport();
            }}
            accessibilityRole="button"
            accessibilityLabel={t('scamProtection.reportNow')}
          >
            <Text style={[styles.link, styles.reportLink, { color: accent }]}>{t('scamProtection.reportNow')}</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  wrapCompact: {
    marginHorizontal: 0,
    padding: spacing.sm,
  },
  textCol: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  reportLink: {
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
