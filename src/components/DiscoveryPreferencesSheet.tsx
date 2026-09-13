import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DiscoveryPreferences,
  SHOW_ME_LABELS,
  ShowMePreference,
} from '../types/preferences';
import { colors, radii, spacing } from '../theme';

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
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepButton}
          onPress={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.stepValue}>{value}{suffix}</Text>
        <Pressable
          style={styles.stepButton}
          onPress={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </Pressable>
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Discovery settings</Text>
          <Pressable onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Show me</Text>
        <View style={styles.chipRow}>
          {showMeOptions.map((option) => {
            const selected = preferences.showMe === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => onChange({ ...preferences, showMe: option })}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {SHOW_ME_LABELS[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Distance</Text>
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

        <Text style={styles.sectionTitle}>Age range</Text>
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

        <Text style={styles.hint}>
          Profiles outside these settings are hidden from your deck.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  doneButton: {
    padding: spacing.sm,
  },
  doneText: {
    color: colors.gradientEnd,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: colors.gradientEnd,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowLabel: {
    color: colors.text,
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
    backgroundColor: '#2A2A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 56,
    textAlign: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.lg,
  },
});
