import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { VOICE_PROMPT_QUESTIONS, VoicePrompt } from '../types/profile';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type VoicePromptSheetProps = {
  visible: boolean;
  existing?: VoicePrompt;
  onClose: () => void;
  onSave: (prompt: VoicePrompt) => void;
  onRemove: () => void;
};

export function VoicePromptSheet({
  visible,
  existing,
  onClose,
  onSave,
  onRemove,
}: VoicePromptSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [question, setQuestion] = useState(existing?.question ?? VOICE_PROMPT_QUESTIONS[0]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hasRecording, setHasRecording] = useState(Boolean(existing));

  useEffect(() => {
    if (visible) {
      setQuestion(existing?.question ?? VOICE_PROMPT_QUESTIONS[0]);
      setHasRecording(Boolean(existing));
      setElapsed(existing?.durationSeconds ?? 0);
      setRecording(false);
    }
  }, [visible, existing]);

  useEffect(() => {
    if (!recording) {
      return undefined;
    }
    const interval = setInterval(() => {
      setElapsed((value) => {
        const next = value + 1;
        if (next >= 30) {
          setRecording(false);
          setHasRecording(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [recording]);

  const handleToggleRecord = () => {
    if (recording) {
      setRecording(false);
      if (elapsed > 0) {
        setHasRecording(true);
      }
      return;
    }
    setElapsed(0);
    setRecording(true);
  };

  const handleSave = () => {
    if (!hasRecording || elapsed < 1) {
      return;
    }
    onSave({
      question,
      durationSeconds: Math.min(elapsed, 30),
      recordedAt: new Date().toISOString(),
    });
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
          <Text style={[styles.title, { color: colors.text }]}>{t('editProfile.voicePromptLabel')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('voicePrompt.subtitle')}</Text>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('voicePrompt.choosePrompt')}</Text>
          <View style={styles.chipRow}>
            {VOICE_PROMPT_QUESTIONS.map((option) => {
              const selected = question === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.background,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => setQuestion(option)}
                >
                  <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}>
                    {option}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <AnimatedPressable
            style={[
              styles.recordButton,
              {
                backgroundColor: recording ? colors.nope : colors.gradientEnd,
              },
            ]}
            onPress={handleToggleRecord}
          >
            <Ionicons name={recording ? 'stop' : 'mic'} size={28} color={colors.text} />
          </AnimatedPressable>
          <Text style={[styles.timer, { color: colors.text }]}>
            {recording
              ? t('voicePrompt.recording', { seconds: elapsed })
              : hasRecording
                ? t('voicePrompt.recorded', { seconds: elapsed })
                : t('voicePrompt.tapToRecord')}
          </Text>

          <AnimatedPressable
            style={[styles.saveButton, { backgroundColor: colors.gradientEnd }, !hasRecording && styles.saveDisabled]}
            onPress={handleSave}
            disabled={!hasRecording}
          >
            <Text style={[styles.saveText, { color: colors.text }]}>{t('voicePrompt.save')}</Text>
          </AnimatedPressable>

          {existing && (
            <AnimatedPressable style={styles.removeButton} onPress={onRemove}>
              <Text style={[styles.removeText, { color: colors.nope }]}>{t('voicePrompt.remove')}</Text>
            </AnimatedPressable>
          )}
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  timer: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  saveButton: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
  },
  removeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  removeText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
