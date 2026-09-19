import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { freeTierComparisonRows } from '../utils/genderAccountPerks';
import { radii, spacing } from '../theme';

function CellValue({ value }: { value: string | boolean }) {
  const { colors } = useTheme();

  if (typeof value === 'boolean') {
    return (
      <Ionicons
        name={value ? 'checkmark-circle' : 'close-circle'}
        size={20}
        color={value ? colors.like : colors.textMuted}
      />
    );
  }
  return <Text style={[styles.cellText, { color: colors.text }]}>{value}</Text>;
}

export function SparkPlusComparisonTable() {
  const { colors } = useTheme();
  const { user } = useApp();
  const { t } = useTranslation();
  const rows = freeTierComparisonRows(user.gender, t);

  return (
    <View style={[styles.table, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerFeature, { color: colors.textMuted }]}>{t('sparkPlusComparison.feature')}</Text>
        <Text style={[styles.headerCol, { color: colors.textMuted }]}>{t('sparkPlusComparison.free')}</Text>
        <Text style={[styles.headerCol, { color: colors.gradientEnd }]}>{t('sparkPlusComparison.sparkPlus')}</Text>
      </View>
      {rows.map((row) => (
        <View key={row.feature} style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.featureName, { color: colors.text }]}>{row.feature}</Text>
          <View style={styles.cell}>
            <CellValue value={row.free} />
          </View>
          <View style={styles.cell}>
            <CellValue value={row.plus} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerFeature: {
    flex: 2,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerCol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  featureName: {
    flex: 2,
    fontSize: 14,
    fontWeight: '600',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
