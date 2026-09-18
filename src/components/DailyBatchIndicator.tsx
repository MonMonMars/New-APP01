import { StyleSheet, Text, View } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type DailyBatchIndicatorProps = {
  remaining: number;
  total: number;
  slim?: boolean;
};

/** Coffee Meets Bagel–style daily curated batch counter. */
export function DailyBatchIndicator({ remaining, total, slim = false }: DailyBatchIndicatorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (remaining <= 0) {
    return null;
  }

  return (
    <View style={[styles.container, slim && styles.containerSlim]}>
      <View style={[styles.dot, slim && styles.dotSlim, { backgroundColor: colors.heartRed }]} />
      <Text style={[styles.text, slim && styles.textSlim]}>
        {t('discoverHub.batchRemaining', { remaining, total })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  containerSlim: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.md,
    marginBottom: 0,
    backgroundColor: 'rgba(26, 26, 28, 0.72)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.heartRed,
  },
  dotSlim: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  textSlim: {
    fontSize: 11,
    fontWeight: '700',
  },
});
