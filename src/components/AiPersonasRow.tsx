import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { aiPersonaProfiles, getAiPersonaConfig } from '../data/aiPersonas';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AiPersonaBadge } from './AiPersonaBadge';
import { AnimatedPressable } from './AnimatedPressable';

type AiPersonasRowProps = {
  onSelect: (profile: Profile) => void;
};

export function AiPersonasRow({ onSelect }: AiPersonasRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={colors.gradientEnd} />
        <Text style={[styles.title, { color: colors.text }]}>{t('discoverHub.aiPersonasTitle')}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('discoverHub.aiPersonasHint')}</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {t('discoverHub.aiPersonasSubtitle')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {aiPersonaProfiles.map((profile) => {
          const config = getAiPersonaConfig(profile);
          return (
            <AnimatedPressable
              key={profile.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => onSelect(profile)}
              accessibilityRole="button"
              accessibilityLabel={t('discoverHub.viewProfileA11y', { name: profile.name })}
            >
              <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
              <AiPersonaBadge profile={profile} compact />
              <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.tagline, { color: colors.textMuted }]} numberOfLines={2}>
                {config?.tagline ?? t('discoverHub.aiPersonaFallback')}
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
