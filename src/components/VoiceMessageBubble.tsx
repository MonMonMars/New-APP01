import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type VoiceMessageBubbleProps = {
  durationSeconds: number;
  isMine: boolean;
  voiceUrl?: string;
};

export function VoiceMessageBubble({ durationSeconds, isMine, voiceUrl }: VoiceMessageBubbleProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const player = useAudioPlayer(voiceUrl ?? null);
  const status = useAudioPlayerStatus(player);
  const [simulatedPlaying, setSimulatedPlaying] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const hasAudio = Boolean(voiceUrl);
  const playing = hasAudio ? status.playing : simulatedPlaying;
  const progress = hasAudio
    ? status.duration > 0
      ? status.currentTime / status.duration
      : 0
    : simulatedProgress;

  useEffect(() => {
    if (hasAudio || !simulatedPlaying) {
      return undefined;
    }
    const interval = setInterval(() => {
      setSimulatedProgress((value) => {
        const next = value + 0.08;
        if (next >= 1) {
          setSimulatedPlaying(false);
          return 0;
        }
        return next;
      });
    }, durationSeconds * 30);
    return () => clearInterval(interval);
  }, [durationSeconds, hasAudio, simulatedPlaying]);

  const togglePlayback = () => {
    if (hasAudio) {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
      return;
    }
    setSimulatedPlaying((value) => !value);
  };

  const bars = [0.35, 0.7, 1, 0.55, 0.85, 0.45, 0.65];

  return (
    <AnimatedPressable
      style={styles.row}
      onPress={togglePlayback}
      accessibilityRole="button"
      accessibilityLabel={t('chat.voiceMessageA11y', { seconds: durationSeconds })}
    >
      <View style={[styles.playBtn, { backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : colors.border }]}>
        <Ionicons name={playing ? 'pause' : 'play'} size={14} color={colors.text} />
      </View>
      <View style={styles.waveRow}>
        {bars.map((height, index) => {
          const active = playing && index / bars.length <= progress;
          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: 6 + height * 14,
                  backgroundColor: active ? colors.text : isMine ? 'rgba(255,255,255,0.45)' : colors.textMuted,
                  opacity: active ? 1 : 0.55,
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.duration, { color: colors.text }]}>{durationSeconds}s</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 180,
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 22,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 24,
  },
});
