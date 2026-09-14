import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';

type VibeGameSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onSendGuess: (message: string) => void;
};

const VIBE_LABELS = ['Chill 😌', 'Playful 😄', 'Romantic 🌹', 'Adventurous 🏔️', 'Curious 🤔'];

/** Apollo Read My Vibe–inspired mini-game in chat. */
export function VibeGameSheet({ visible, profileName, onClose, onSendGuess }: VibeGameSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [secretVibe] = useState(() => Math.floor(Math.random() * VIBE_LABELS.length));
  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (index: number) => {
    setPicked(index);
    const correct = index === secretVibe;
    const message = correct
      ? `Read My Vibe: I guessed you're feeling ${VIBE_LABELS[index]} — nailed it! 🎯`
      : `Read My Vibe: I'm guessing ${VIBE_LABELS[index]} — am I close?`;
    setTimeout(() => {
      onSendGuess(message);
      setPicked(null);
      onClose();
    }, 800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Read My Vibe</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            What vibe is {profileName} giving off right now? Guess to break the ice.
          </Text>
          <View style={styles.grid}>
            {VIBE_LABELS.map((label, index) => (
              <Pressable
                key={label}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  picked === index && { borderColor: colors.gradientEnd, borderWidth: 2 },
                ]}
                onPress={() => handlePick(index)}
                disabled={picked !== null}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
              </Pressable>
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
