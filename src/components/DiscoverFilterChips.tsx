import { ScrollView, StyleSheet, Text } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import {
  DISCOVER_FILTER_LABELS,
  DiscoverFilter,
} from '../types/preferences';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type DiscoverFilterChipsProps = {
  activeFilters: DiscoverFilter[];
  onToggle: (filter: DiscoverFilter) => void;
  compact?: boolean;
};

const FILTER_OPTIONS: DiscoverFilter[] = ['active_today', 'new_here', 'has_bio', 'verified'];

export function DiscoverFilterChips({ activeFilters, onToggle, compact = false }: DiscoverFilterChipsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, compact && styles.rowCompact]}
    >
      {FILTER_OPTIONS.map((filter) => {
        const selected = activeFilters.includes(filter);
        return (
          <AnimatedPressable
            key={filter}
            style={[
              styles.chip,
              compact && styles.chipCompact,
              { backgroundColor: compact ? 'rgba(26, 26, 28, 0.72)' : colors.surface, borderColor: selected ? colors.gradientEnd : 'transparent' },
              selected && styles.chipSelected,
            ]}
            onPress={() => onToggle(filter)}
          >
            <Text style={[styles.chipText, compact && styles.chipTextCompact, { color: selected ? colors.text : colors.textMuted }]}>
              {DISCOVER_FILTER_LABELS[filter]}
            </Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  rowCompact: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
  },
  chipCompact: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderWidth: 1,
  },
  chipSelected: {},
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextCompact: {
    fontSize: 11,
    fontWeight: '700',
  },
});
