import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

type VoiceNoteSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onSend: (durationSeconds: number) => void;
};

export function VoiceNoteSheet({ visible, profileName, onClose, onSend }: VoiceNoteSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (visible) {
      setRecording(false);
      setElapsed(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!recording) {
      return undefined;
    }
    const interval = setInterval(() => {
      setElapsed((value) => {
        const next = value + 1;
        if (next >= 30) {
          setRecording(false);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [recording]);

  const handleSend = () => {
    if (elapsed < 1) {
      return;
    }
    onSend(elapsed);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AnimatedPressable style={[styles.overlay, modalFill]} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.text }]}>Voice note</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Record a quick voice note for {profileName}. Tap record, then send when you are ready.
          </Text>
          <AnimatedPressable
            style={[styles.recordButton, { backgroundColor: recording ? colors.nope : colors.gradientEnd }]}
            onPress={() => setRecording((value) => !value)}
          >
            <Ionicons name={recording ? 'stop' : 'mic'} size={28} color={colors.text} />
          </AnimatedPressable>
          <Text style={[styles.timer, { color: colors.text }]}>
            {recording ? `Recording… ${elapsed}s` : elapsed > 0 ? `${elapsed}s recorded` : 'Tap to record'}
          </Text>
          <AnimatedPressable
            style={[styles.sendButton, { backgroundColor: colors.gradientEnd }, elapsed < 1 && styles.sendDisabled]}
            onPress={handleSend}
            disabled={elapsed < 1}
          >
            <Text style={[styles.sendText, { color: colors.text }]}>Send voice note</Text>
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
});
