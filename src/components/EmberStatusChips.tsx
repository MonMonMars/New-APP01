import { StyleSheet, Text, View } from 'react-native';

import { useAppLocale } from '../hooks/useAppLocale';
import { useTheme } from '../context/ThemeContext';
import {
  getEmberAvailabilityLabel,
  getEmberDiscretionLabel,
  getEmberRelationshipLabel,
  getEmberSeekingLabel,
} from '../i18n/labels';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';

type EmberStatusChipsProps = {
  profile: Pick<
    Profile,
    'relationshipStatus' | 'emberDiscretion' | 'emberSeeking' | 'emberAvailability'
  >;
  compact?: boolean;
};

/** Married / Divorced plus Ember-only chips. Hidden when Spark-only (single, no Ember fields). */
export function EmberStatusChips({ profile, compact = false }: EmberStatusChipsProps) {
  const { colors } = useTheme();
  const { locale } = useAppLocale();
  const emberStatus = getEmberRelationshipLabel(locale, profile.relationshipStatus);
  const labels = [
    emberStatus,
    profile.emberDiscretion ? getEmberDiscretionLabel(locale, profile.emberDiscretion) : null,
    profile.emberSeeking ? getEmberSeekingLabel(locale, profile.emberSeeking) : null,
    compact ? null : profile.emberAvailability ? getEmberAvailabilityLabel(locale, profile.emberAvailability) : null,
  ].filter((item): item is string => item !== null);

  if (labels.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {labels.map((label) => (
        <View
          key={label}
          style={[
            styles.chip,
            compact && styles.chipCompact,
            { backgroundColor: `${colors.ember}22`, borderColor: `${colors.ember}66` },
          ]}
        >
          <Text
            style={[styles.text, compact && styles.textCompact, { color: colors.ember }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipCompact: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
  textCompact: {
    fontSize: 10,
  },
});
