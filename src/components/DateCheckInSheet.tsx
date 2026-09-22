import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type DateCheckInSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onStart: (payload: { location: string; plannedAt: string; emergencyContact?: string }) => void;
};

export function DateCheckInSheet({
  visible,
  profileName,
  onClose,
  onStart,
}: DateCheckInSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [hoursFromNow, setHoursFromNow] = useState(4);

  const timePresets = [
    { label: t('chat.dateCheckInInOneHour'), hours: 1 },
    { label: t('chat.dateCheckInTonight'), hours: 4 },
    { label: t('chat.dateCheckInTomorrow'), hours: 24 },
  ] as const;

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
      <AnimatedPressable style={[styles.overlay, modalFill]} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={24} color={colors.gradientEnd} />
            <Text style={[styles.title, { color: colors.text }]}>{t('safety.dateCheckIn')}</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('chat.dateCheckInSubtitle', { name: profileName })}
          </Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('chat.dateCheckInWhere')}</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={t('chat.dateCheckInWherePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('chat.dateCheckInWhen')}</Text>
          <View style={styles.presetRow}>
            {timePresets.map((preset) => {
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

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('chat.dateCheckInTrustedContact')}</Text>
          <TextInput
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder={t('chat.dateCheckInTrustedPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          />

          <AnimatedPressable
            style={[styles.startButton, { backgroundColor: colors.gradientEnd }, !canStart && styles.startDisabled]}
            onPress={handleStart}
            disabled={!canStart}
          >
            <Text style={[styles.startText, { color: colors.text }]}>{t('chat.dateCheckInStart')}</Text>
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
