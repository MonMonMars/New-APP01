import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BOOST_DURATION_MS } from '../types/subscription';
import { colors, radii, spacing } from '../theme';

type BoostCardProps = {
  boostActiveUntil: string | null;
  isSparkPlus: boolean;
  onActivate: () => void;
};

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function BoostCard({ boostActiveUntil, isSparkPlus, onActivate }: BoostCardProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!boostActiveUntil) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [boostActiveUntil]);

  const activeUntil = boostActiveUntil ? new Date(boostActiveUntil).getTime() : 0;
  const isActive = activeUntil > now;
  const remaining = isActive ? activeUntil - now : 0;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="flash" size={24} color={isActive ? '#FFD700' : colors.gradientEnd} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>
          {isActive ? 'Boost active' : 'Boost your profile'}
        </Text>
        <Text style={styles.subtitle}>
          {isActive
            ? `Top profile for ${formatRemaining(remaining)} remaining`
            : isSparkPlus
              ? '1 free Boost per week with Spark+'
              : 'Be seen by more people for 30 minutes'}
        </Text>
      </View>
      {!isActive && (
        <Pressable style={styles.button} onPress={onActivate}>
          <Text style={styles.buttonText}>Boost</Text>
        </Pressable>
      )}
      {isActive && (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>LIVE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  activeBadge: {
    backgroundColor: '#FFD700',
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  activeBadgeText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '900',
  },
});
