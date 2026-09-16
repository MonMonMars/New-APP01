import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme';
import { Profile } from '../types/profile';
import { AnimatedPressable } from './AnimatedPressable';

type SparkNoteVariant = 'spark' | 'ember';

function noteCopy(variant: SparkNoteVariant, name: string): { title: string; subtitle: string } {
  switch (variant) {
    case 'ember':
      return {
        title: 'Discreet note',
        subtitle: `A private note only ${name} sees — it won't appear in notifications.`,
      };
    case 'spark':
      return {
        title: 'Spark Note',
        subtitle: `Send ${name} a message with your like — like a comment on Hinge.`,
      };
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

type SparkNoteSheetProps = {
  visible: boolean;
  profile: Profile | null;
  remainingNotes: number;
  variant?: 'spark' | 'ember';
  onClose: () => void;
  onSend: (note: string) => void;
  onSkip: () => void;
};

export function SparkNoteSheet({
  visible,
  profile,
  remainingNotes,
  variant = 'spark',
  onClose,
  onSend,
  onSkip,
}: SparkNoteSheetProps) {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setNote('');
    }
  }, [visible, profile?.id]);

  if (!profile) {
    return null;
  }

  const copy = noteCopy(variant, profile.name);
  const canSend = note.trim().length > 0 && remainingNotes > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AnimatedPressable style={styles.overlay} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Ionicons name="chatbubble-ellipses" size={24} color={variant === 'ember' ? colors.ember : colors.gradientEnd} />
            <Text style={styles.title}>{copy.title}</Text>
          </View>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
          <Text style={styles.quota}>
            {remainingNotes > 0
              ? `${remainingNotes} note${remainingNotes === 1 ? '' : 's'} left today`
              : 'No notes left today — upgrade to Spark+ for unlimited'}
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={`Say something to ${profile.name}...`}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            maxLength={200}
            autoFocus
          />

          <AnimatedPressable
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={() => {
              if (canSend) {
                onSend(note.trim());
                setNote('');
              }
            }}
            disabled={!canSend}
          >
            <Text style={styles.sendText}>Send like + note</Text>
          </AnimatedPressable>

          <AnimatedPressable style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Like without note</Text>
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  quota: {
    color: colors.gradientEnd,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  sendButton: {
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
