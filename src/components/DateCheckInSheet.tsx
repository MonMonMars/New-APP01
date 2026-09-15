import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type DateCheckInSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onStart: (payload: { location: string; plannedAt: string; emergencyContact?: string }) => void;
};

const TIME_PRESETS = [
  { label: 'In 1 hour', hours: 1 },
  { label: 'Tonight', hours: 4 },
  { label: 'Tomorrow evening', hours: 24 },
] as const;

export function DateCheckInSheet({
  visible,
  profileName,
  onClose,
  onStart,
}: DateCheckInSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [location, setLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [hoursFromNow, setHoursFromNow] = useState(4);

  const canStart = location.trim().length > 0;

  const handleStart = () => {
    if (!canStart) {
      return;
    }
    onStart({
      location: location.trim(),
      plannedAt: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString(),
      emergencyContact: emergencyContact.trim() || undefined,
    });
    setLocation('');
    setEmergencyContact('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AnimatedPressable style={styles.overlay} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={24} color={colors.gradientEnd} />
            <Text style={[styles.title, { color: colors.text }]}>Date check-in</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Share your plans with {profileName}. We&apos;ll remind you to check in when you arrive and when you&apos;re home safe.
          </Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>Where are you meeting?</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Cafe name, neighborhood, or address"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>When</Text>
          <View style={styles.presetRow}>
            {TIME_PRESETS.map((preset) => {
              const selected = hoursFromNow === preset.hours;
              return (
                <AnimatedPressable
                  key={preset.label}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.background,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => setHoursFromNow(preset.hours)}
                >
                  <Text style={[styles.presetText, { color: selected ? '#fff' : colors.text }]}>
                    {preset.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Trusted contact (optional)</Text>
          <TextInput
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="Friend or family name"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          />

          <AnimatedPressable
            style={[styles.startButton, { backgroundColor: colors.gradientEnd }, !canStart && styles.startDisabled]}
            onPress={handleStart}
            disabled={!canStart}
          >
            <Text style={[styles.startText, { color: colors.text }]}>Start check-in plan</Text>
          </AnimatedPressable>
        </AnimatedPressable>
      </AnimatedPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radii.card,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetChip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  startButton: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  startDisabled: {
    opacity: 0.4,
  },
  startText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
