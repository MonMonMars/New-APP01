import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { Profile, ProfilePrompt } from '../types/profile';
import { radii, spacing } from '../theme';

type PromptLikeSheetProps = {
  visible: boolean;
  profile: Profile | null;
  prompt: ProfilePrompt | null;
  onClose: () => void;
  onSend: (comment: string) => void;
};

/** Hinge-style like on a specific prompt with optional comment. */
export function PromptLikeSheet({ visible, profile, prompt, onClose, onSend }: PromptLikeSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [comment, setComment] = useState('');

  if (!profile || !prompt) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handleRow}>
            <Text style={[styles.title, { color: colors.text }]}>Like {profile.name}&apos;s answer</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          <View style={[styles.promptCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.question, { color: colors.gradientEnd }]}>{prompt.question}</Text>
            <Text style={[styles.answer, { color: colors.text }]}>{prompt.answer}</Text>
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment (optional)..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            multiline
          />
          <Pressable
            style={[styles.sendButton, { backgroundColor: colors.heartPink }]}
            onPress={() => {
              onSend(comment.trim());
              setComment('');
            }}
          >
            <Ionicons name="heart" size={18} color="#fff" />
            <Text style={styles.sendText}>Send Like</Text>
          </Pressable>
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
    gap: spacing.md,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  promptCard: {
    borderRadius: radii.card,
    padding: spacing.md,
  },
  question: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  answer: {
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    borderRadius: radii.card,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
