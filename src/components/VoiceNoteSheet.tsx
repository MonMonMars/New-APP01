import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type VoiceNoteSheetProps = {
  visible: boolean;
  profileName: string;
  busy?: boolean;
  onClose: () => void;
  onSend: (durationSeconds: number, voiceUrl?: string) => void;
};

export function VoiceNoteSheet({ visible, profileName, busy = false, onClose, onSend }: VoiceNoteSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const elapsedSeconds = Math.min(30, Math.max(0, Math.round((recorderState.durationMillis || 0) / 1000)));

  useEffect(() => {
    if (!visible) {
      if (recorderState.isRecording) {
        void recorder.stop();
      }
      return;
    }
    setRecordedUri(null);
    void setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
  }, [visible, recorder, recorderState.isRecording]);

  useEffect(() => {
    if (!recorderState.isRecording) {
      return;
    }
    if (recorderState.durationMillis >= 30_000) {
      void recorder.stop().then(() => {
        setRecordedUri(recorder.uri);
      });
    }
  }, [recorder, recorderState.durationMillis, recorderState.isRecording]);

  const toggleRecording = () => {
    void (async () => {
      if (recorderState.isRecording) {
        await recorder.stop();
        setRecordedUri(recorder.uri);
        return;
      }

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('chat.voiceNotePermissionTitle'), t('chat.voiceNotePermissionBody'));
        return;
      }

      setRecordedUri(null);
      recorder.record();
    })();
  };

  const handleSend = () => {
    const seconds = Math.max(1, elapsedSeconds);
    if (seconds < 1) {
      return;
    }
    onSend(seconds, recordedUri ?? recorder.uri ?? undefined);
    onClose();
  };

  const displaySeconds = elapsedSeconds;
  const isRecording = recorderState.isRecording;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AnimatedPressable style={[styles.overlay, modalFill]} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.text }]}>{t('chat.voiceNoteTitle')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('chat.voiceNoteSubtitle', { name: profileName })}
          </Text>
          <AnimatedPressable
            style={[styles.recordButton, { backgroundColor: isRecording ? colors.nope : colors.gradientEnd }]}
            onPress={toggleRecording}
            disabled={busy}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={28} color={colors.text} />
          </AnimatedPressable>
          <Text style={[styles.timer, { color: colors.text }]}>
            {isRecording
              ? t('chat.voiceNoteRecording', { seconds: displaySeconds })
              : displaySeconds > 0
                ? t('chat.voiceNoteRecorded', { seconds: displaySeconds })
                : t('chat.voiceNoteTapRecord')}
          </Text>
          <AnimatedPressable
            style={[
              styles.sendButton,
              { backgroundColor: colors.gradientEnd },
              (displaySeconds < 1 || busy) && styles.sendDisabled,
            ]}
            onPress={handleSend}
            disabled={displaySeconds < 1 || busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.sendText, { color: colors.text }]}>{t('chat.voiceNoteSend')}</Text>
            )}
          </AnimatedPressable>
          {busy ? (
            <Text style={[styles.uploadHint, { color: colors.textMuted }]}>{t('chat.voiceNoteUploading')}</Text>
          ) : null}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  timer: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  sendButton: {
    alignSelf: 'stretch',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontSize: 16,
    fontWeight: '700',
  },
  uploadHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
  },
});
