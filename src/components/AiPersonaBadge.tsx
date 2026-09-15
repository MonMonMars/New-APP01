import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { isAiPersonaProfile } from '../data/aiPersonas';
import { radii, spacing } from '../theme';

type AiPersonaBadgeProps = {
  profile: Profile;
  compact?: boolean;
};

export function AiPersonaBadge({ profile, compact = false }: AiPersonaBadgeProps) {
  const { colors } = useTheme();

  if (!isAiPersonaProfile(profile)) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        compact ? styles.badgeCompact : styles.badgeDefault,
        { backgroundColor: 'rgba(138, 43, 226, 0.85)', borderColor: 'rgba(255,255,255,0.35)' },
      ]}
    >
      <Ionicons name="sparkles" size={compact ? 10 : 12} color={colors.text} />
      <Text style={[styles.text, compact && styles.textCompact, { color: colors.text }]}>
        AI
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radii.button,
    borderWidth: 1,
  },
  badgeDefault: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  textCompact: {
    fontSize: 9,
  },
});
