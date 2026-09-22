import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import {
  getEmberDiscretionLabel,
  getEmberSeekingLabel,
  getEmberStatusLabel,
  getRelationshipIntentLabel,
} from '../i18n/labels';
import {
  AdvancedDiscoverFilters,
} from '../types/preferences';
import {
  EmberDiscretion,
  EmberSeeking,
  RelationshipIntent,
} from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const INTENT_OPTIONS: RelationshipIntent[] = ['long_term', 'short_term', 'new_friends', 'not_sure'];
const EMBER_STATUS_OPTIONS = ['married', 'divorced'] as const;
const EMBER_DISCRETION_OPTIONS: EmberDiscretion[] = ['open', 'careful', 'hidden'];
const EMBER_SEEKING_OPTIONS: EmberSeeking[] = ['online', 'travel', 'ongoing', 'light'];

type AdvancedFiltersSectionProps = {
  filters: AdvancedDiscoverFilters;
  isSparkPlus: boolean;
  onChange: (filters: AdvancedDiscoverFilters) => void;
  onUpgrade: () => void;
  emberMode?: boolean;
};

export function AdvancedFiltersSection({
  filters,
  isSparkPlus,
  onChange,
  onUpgrade,
  emberMode = false,
}: AdvancedFiltersSectionProps) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const accent = emberMode ? colors.ember : colors.gradientEnd;

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

  const toggleEmberStatus = (status: (typeof EMBER_STATUS_OPTIONS)[number]) => {
    const current = filters.emberStatuses ?? [];
    const next = current.includes(status)
      ? current.filter((item) => item !== status)
      : [...current, status];
    onChange({ ...filters, emberStatuses: next });
  };

  const toggleEmberDiscretion = (value: EmberDiscretion) => {
    const current = filters.emberDiscretion ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, emberDiscretion: next });
  };

  const toggleEmberSeeking = (value: EmberSeeking) => {
    const current = filters.emberSeeking ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, emberSeeking: next });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textMuted }]}>
          {emberMode ? t('preferences.emberFiltersTitle') : t('preferences.advancedFiltersTitle')}
        </Text>
        {!emberMode && !isSparkPlus && (
          <View style={[styles.plusBadge, { backgroundColor: colors.gradientEnd }]}>
            <Ionicons name="diamond" size={10} color={colors.text} />
            <Text style={[styles.plusText, { color: colors.text }]}>{t('sparkPlus.memberBadge')}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {emberMode ? t('preferences.advancedFiltersEmberHint') : t('preferences.advancedFiltersSparkHint')}
      </Text>

      {emberMode ? (
        <>
          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {t('preferences.advancedFiltersStatus')}
          </Text>
          <View style={styles.chipRow}>
            {EMBER_STATUS_OPTIONS.map((status) => {
              const selected = filters.emberStatuses?.includes(status) ?? false;
              return (
                <AnimatedPressable
                  key={status}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surface, borderColor: selected ? accent : colors.border },
                    selected && styles.chipSelected,
                  ]}
                  onPress={() => toggleEmberStatus(status)}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.text : colors.textMuted }]}>
                    {getEmberStatusLabel(locale, status)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {t('preferences.advancedFiltersDiscretion')}
          </Text>
          <View style={styles.chipRow}>
            {EMBER_DISCRETION_OPTIONS.map((value) => {
              const selected = filters.emberDiscretion?.includes(value) ?? false;
              return (
                <AnimatedPressable
                  key={value}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surface, borderColor: selected ? accent : colors.border },
                    selected && styles.chipSelected,
                  ]}
                  onPress={() => toggleEmberDiscretion(value)}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.text : colors.textMuted }]}>
                    {getEmberDiscretionLabel(locale, value)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {t('preferences.advancedFiltersLookingFor')}
          </Text>
          <View style={styles.chipRow}>
            {EMBER_SEEKING_OPTIONS.map((value) => {
              const selected = filters.emberSeeking?.includes(value) ?? false;
              return (
                <AnimatedPressable
                  key={value}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surface, borderColor: selected ? accent : colors.border },
                    selected && styles.chipSelected,
                  ]}
                  onPress={() => toggleEmberSeeking(value)}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.text : colors.textMuted }]}>
                    {getEmberSeekingLabel(locale, value)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {t('preferences.advancedFiltersIntent')}
          </Text>
          <View style={styles.chipRow}>
            {INTENT_OPTIONS.map((intent) => {
              const selected = filters.intents?.includes(intent) ?? false;
              return (
                <AnimatedPressable
                  key={intent}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surface, borderColor: selected ? accent : colors.border },
                    selected && styles.chipSelected,
                  ]}
                  onPress={() => toggleIntent(intent)}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.text : colors.textMuted }]}>
                    {getRelationshipIntentLabel(locale, intent)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </>
      )}

      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            {t('preferences.advancedFiltersSharedInterests')}
          </Text>
          <Text style={[styles.rowHint, { color: colors.textMuted }]}>
            {t('preferences.advancedFiltersSharedInterestsHint')}
          </Text>
        </View>
        <Switch
          value={filters.sharedInterestsOnly ?? false}
          onValueChange={toggleSharedInterests}
          trackColor={{ false: colors.border, true: accent }}
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
