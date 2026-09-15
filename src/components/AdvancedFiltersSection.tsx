import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import {
  AdvancedDiscoverFilters,
  RELATIONSHIP_INTENT_LABELS,
} from '../types/preferences';
import { RelationshipIntent } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const INTENT_OPTIONS: RelationshipIntent[] = ['long_term', 'short_term', 'new_friends', 'not_sure'];

type AdvancedFiltersSectionProps = {
  filters: AdvancedDiscoverFilters;
  isSparkPlus: boolean;
  onChange: (filters: AdvancedDiscoverFilters) => void;
  onUpgrade: () => void;
};

export function AdvancedFiltersSection({
  filters,
  isSparkPlus,
  onChange,
  onUpgrade,
}: AdvancedFiltersSectionProps) {
  const { colors } = useTheme();

  const toggleIntent = (intent: RelationshipIntent) => {
    if (!isSparkPlus) {
      onUpgrade();
      return;
    }
    const current = filters.intents ?? [];
    const next = current.includes(intent)
      ? current.filter((item) => item !== intent)
      : [...current, intent];
    onChange({ ...filters, intents: next });
  };

  const toggleSharedInterests = (enabled: boolean) => {
    if (!isSparkPlus) {
      onUpgrade();
      return;
    }
    onChange({ ...filters, sharedInterestsOnly: enabled });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textMuted }]}>Advanced filters</Text>
        {!isSparkPlus && (
          <View style={[styles.plusBadge, { backgroundColor: colors.gradientEnd }]}>
            <Ionicons name="diamond" size={10} color={colors.text} />
            <Text style={[styles.plusText, { color: colors.text }]}>Spark+</Text>
          </View>
        )}
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Hinge-style intent matching and shared-interest discovery.
      </Text>

      <Text style={[styles.subLabel, { color: colors.textMuted }]}>Relationship intent</Text>
      <View style={styles.chipRow}>
        {INTENT_OPTIONS.map((intent) => {
          const selected = filters.intents?.includes(intent) ?? false;
          return (
            <AnimatedPressable
              key={intent}
              style={[
                styles.chip,
                { backgroundColor: colors.surface, borderColor: selected ? colors.gradientEnd : colors.border },
                selected && styles.chipSelected,
              ]}
              onPress={() => toggleIntent(intent)}
            >
              <Text style={[styles.chipText, { color: selected ? colors.text : colors.textMuted }]}>
                {RELATIONSHIP_INTENT_LABELS[intent]}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Shared interests only</Text>
          <Text style={[styles.rowHint, { color: colors.textMuted }]}>
            Show people who like at least one thing you do
          </Text>
        </View>
        <Switch
          value={filters.sharedInterestsOnly ?? false}
          onValueChange={toggleSharedInterests}
          trackColor={{ false: colors.border, true: colors.gradientEnd }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  plusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  chipSelected: {
    borderWidth: 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowHint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
