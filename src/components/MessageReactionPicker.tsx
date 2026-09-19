import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const REACTIONS = ['❤️', '😂', '🔥', '👍', '😮', '🙏'];

type MessageReactionPickerProps = {
  visible: boolean;
  currentReaction?: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export function MessageReactionPicker({
  visible,
  currentReaction,
  onSelect,
  onClose,
}: MessageReactionPickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('common.close')}>
        <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {REACTIONS.map((emoji) => {
            const selected = currentReaction === emoji;
            return (
              <AnimatedPressable
                key={emoji}
                style={[styles.emojiButton, selected ? { backgroundColor: colors.border } : null]}
                accessibilityRole="button"
                accessibilityLabel={t('chat.reactWith', { emoji })}
                accessibilityState={{ selected }}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  wrap: {
    flexDirection: 'row',
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  emojiButton: {
    padding: spacing.xs,
  },
  emoji: {
    fontSize: 22,
  },
});
