import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from './AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { AppLocale } from '../types/locale';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';

type VibeGameSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onSendGuess: (message: string) => void;
};

const VIBE_KEYS = [
  'chat.vibeChill',
  'chat.vibePlayful',
  'chat.vibeRomantic',
  'chat.vibeAdventurous',
  'chat.vibeCurious',
] as const;

function getVibeLabels(locale: AppLocale, t: (key: string) => string): string[] {
  return VIBE_KEYS.map((key) => t(key));
}

/** Apollo Read My Vibe–inspired mini-game in chat. */
export function VibeGameSheet({ visible, profileName, onClose, onSendGuess }: VibeGameSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const vibeLabels = useMemo(() => getVibeLabels(locale, t), [locale, t]);
  const [secretVibe] = useState(() => Math.floor(Math.random() * VIBE_KEYS.length));
  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (index: number) => {
    setPicked(index);
    const vibe = vibeLabels[index];
    const correct = index === secretVibe;
    const message = correct
      ? t('chat.vibeCorrect', { vibe })
      : t('chat.vibeGuess', { vibe });
    setTimeout(() => {
      onSendGuess(message);
      setPicked(null);
      onClose();
    }, 800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.backdrop, modalFill]}>
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('chat.readMyVibe')}</Text>
            <AnimatedPressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </AnimatedPressable>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('chat.vibeGameSubtitle', { name: profileName })}
          </Text>
          <View style={styles.grid}>
            {vibeLabels.map((label, index) => (
              <AnimatedPressable
                key={VIBE_KEYS[index]}
                scaleTo={0.94}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  picked === index && { borderColor: colors.gradientEnd, borderWidth: 2 },
                ]}
                onPress={() => handlePick(index)}
                disabled={picked !== null}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: radii.card * 2,
    borderTopRightRadius: radii.card * 2,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
