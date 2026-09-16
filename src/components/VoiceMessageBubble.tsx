import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type VoiceMessageBubbleProps = {
  durationSeconds: number;
  isMine: boolean;
};

export function VoiceMessageBubble({ durationSeconds, isMine }: VoiceMessageBubbleProps) {
  const { colors } = useTheme();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const interval = setInterval(() => {
      setProgress((value) => {
        const next = value + 0.08;
        if (next >= 1) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, durationSeconds * 30);
    return () => clearInterval(interval);
  }, [playing, durationSeconds]);

  const bars = [0.35, 0.7, 1, 0.55, 0.85, 0.45, 0.65];

  return (
    <AnimatedPressable
      style={styles.row}
      onPress={() => setPlaying((value) => !value)}
      accessibilityRole="button"
      accessibilityLabel={`Voice message, ${durationSeconds} seconds`}
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
