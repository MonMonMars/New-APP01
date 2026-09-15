import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { aiPersonaProfiles, getAiPersonaConfig } from '../data/aiPersonas';
import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AiPersonaBadge } from './AiPersonaBadge';
import { AnimatedPressable } from './AnimatedPressable';

type AiPersonasRowProps = {
  onSelect: (profile: Profile) => void;
};

export function AiPersonasRow({ onSelect }: AiPersonasRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={colors.gradientEnd} />
        <Text style={[styles.title, { color: colors.text }]}>AI practice matches</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Instant match · LLM replies</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Chat with AI personas to practice before real matches. Always labeled, always safe.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {aiPersonaProfiles.map((profile) => {
          const config = getAiPersonaConfig(profile);
          return (
            <AnimatedPressable
              key={profile.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => onSelect(profile)}
            >
              <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
              <AiPersonaBadge profile={profile} compact />
              <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.tagline, { color: colors.textMuted }]} numberOfLines={2}>
                {config?.tagline ?? 'AI persona'}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  card: {
    width: 120,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    alignItems: 'center',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  tagline: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 2,
  },
});
