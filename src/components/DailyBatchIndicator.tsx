import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme';

type DailyBatchIndicatorProps = {
  remaining: number;
  total: number;
};

/** Coffee Meets Bagel–style daily curated batch counter. */
export function DailyBatchIndicator({ remaining, total }: DailyBatchIndicatorProps) {
  if (remaining <= 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>
        Today&apos;s picks · {remaining} of {total} left
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
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.heartRed,
  },
  text: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
