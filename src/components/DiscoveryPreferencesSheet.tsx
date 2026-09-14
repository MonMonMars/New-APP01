import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import {
  DiscoveryPreferences,
  PASSPORT_CITIES,
  SHOW_ME_LABELS,
  ShowMePreference,
} from '../types/preferences';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type DiscoveryPreferencesSheetProps = {
  visible: boolean;
  preferences: DiscoveryPreferences;
  onClose: () => void;
  onChange: (preferences: DiscoveryPreferences) => void;
};

type StepperRowProps = {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

const showMeOptions: ShowMePreference[] = ['women', 'men', 'everyone'];

function StepperRow({
  label,
  value,
  suffix = '',
  min,
  max,
  step,
  onChange,
}: StepperRowProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.stepper}>
        <AnimatedPressable
          style={[styles.stepButton, { backgroundColor: colors.border }]}
          onPress={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.stepValue, { color: colors.text }]}>{value}{suffix}</Text>
        <AnimatedPressable
          style={[styles.stepButton, { backgroundColor: colors.border }]}
          onPress={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

export function DiscoveryPreferencesSheet({
  visible,
  preferences,
  onClose,
  onChange,
}: DiscoveryPreferencesSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Discovery settings</Text>
          <AnimatedPressable onPress={onClose} style={styles.doneButton}>
            <Text style={[styles.doneText, { color: colors.gradientEnd }]}>Done</Text>
          </AnimatedPressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Show me</Text>
          <View style={styles.chipRow}>
            {showMeOptions.map((option) => {
              const selected = preferences.showMe === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surface },
                    selected && { borderColor: colors.gradientEnd },
                  ]}
                  onPress={() => onChange({ ...preferences, showMe: option })}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.text : colors.textMuted }]}>
                    {SHOW_ME_LABELS[option]}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Passport / Travel mode</Text>
          <View style={[styles.passportRow, { backgroundColor: colors.surface }]}>
            <Ionicons name="airplane" size={20} color={colors.superLike} />
            <Text style={[styles.passportLabel, { color: colors.text }]}>Change location</Text>
            <Switch
              value={preferences.travelMode ?? false}
              onValueChange={(travelMode) =>
                onChange({
                  ...preferences,
                  travelMode,
                  passportCity: travelMode ? (preferences.passportCity ?? PASSPORT_CITIES[0]) : undefined,
                })
              }
              trackColor={{ false: colors.border, true: colors.gradientEnd }}
              thumbColor={colors.text}
            />
          </View>

          {preferences.travelMode && (
            <View style={styles.cityGrid}>
              {PASSPORT_CITIES.map((city) => {
                const selected = preferences.passportCity === city;
                return (
                  <AnimatedPressable
                    key={city}
                    style={[
                      styles.cityChip,
                      { backgroundColor: colors.surface },
                      selected && { borderColor: colors.gradientEnd },
                    ]}
                    onPress={() => onChange({ ...preferences, passportCity: city })}
                  >
                    <Text style={[styles.cityText, { color: selected ? colors.text : colors.textMuted }]}>
                      {city}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Distance</Text>
          <StepperRow
            label="Maximum distance"
            value={preferences.maxDistanceMiles}
            suffix=" mi"
            min={1}
            max={100}
            step={5}
            onChange={(maxDistanceMiles) =>
              onChange({ ...preferences, maxDistanceMiles })
            }
          />

          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Age range</Text>
          <StepperRow
            label="Minimum age"
            value={preferences.minAge}
            min={18}
            max={preferences.maxAge - 1}
            step={1}
            onChange={(minAge) => onChange({ ...preferences, minAge })}
          />
          <StepperRow
            label="Maximum age"
            value={preferences.maxAge}
            min={preferences.minAge + 1}
            max={60}
            step={1}
            onChange={(maxAge) => onChange({ ...preferences, maxAge })}
          />

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Profiles outside these settings are hidden from your deck.
            {preferences.travelMode && preferences.passportCity
              ? ` Showing people near ${preferences.passportCity}.`
              : ''}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  doneButton: {
    padding: spacing.sm,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  passportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  passportLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cityChip: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowLabel: {
    fontSize: 15,
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 56,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
