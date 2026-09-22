import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { getPromptQuestionLabel } from '../i18n/labels';
import { VoicePrompt } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type VoicePromptCardProps = {
  voicePrompt: VoicePrompt;
  profileName?: string;
  compact?: boolean;
};

export function VoicePromptCard({ voicePrompt, profileName, compact = false }: VoicePromptCardProps) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const interval = setInterval(() => {
      setProgress((value) => {
        const next = value + 0.05 / voicePrompt.durationSeconds;
        if (next >= 1) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [playing, voicePrompt.durationSeconds]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      setProgress(0);
      return;
    }
    setPlaying(true);
    setProgress(0);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <Ionicons name="mic" size={18} color={colors.gradientEnd} />
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('editProfile.voicePromptLabel')}</Text>
      </View>
      <Text style={[styles.question, { color: colors.text }]}>
        {getPromptQuestionLabel(locale, voicePrompt.question)}
      </Text>
      <AnimatedPressable
        style={[styles.playRow, { backgroundColor: colors.background }]}
        onPress={togglePlay}
      >
        <View style={[styles.playButton, { backgroundColor: colors.gradientEnd }]}>
          <Ionicons name={playing ? 'pause' : 'play'} size={18} color={colors.text} />
        </View>
        <View style={styles.waveform}>
          <View style={[styles.waveTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.waveFill,
                { backgroundColor: colors.gradientEnd, width: `${Math.max(progress * 100, 8)}%` },
              ]}
            />
          </View>
          <Text style={[styles.duration, { color: colors.textMuted }]}>
            {voicePrompt.durationSeconds}s{profileName ? ` · ${profileName}` : ''}
          </Text>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  cardCompact: {
    marginHorizontal: 0,
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flex: 1,
    gap: 4,
  },
  waveTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  waveFill: {
    height: '100%',
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
  },
});
