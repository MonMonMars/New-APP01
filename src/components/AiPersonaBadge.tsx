import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useOptionalAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { isAiPersonaProfile } from '../data/aiPersonas';
import { ACCOUNT_KIND_LABELS, resolveAccountKind } from '../types/accountKind';
import { radii, spacing } from '../theme';

type AiPersonaBadgeProps = {
  profile: Profile;
  compact?: boolean;
};

export function AiPersonaBadge({ profile, compact = false }: AiPersonaBadgeProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const admin = useOptionalAdmin();
  const showInternal = admin?.showInternalProfileLabels ?? false;

  if (!showInternal) {
    return null;
  }

  const kind = resolveAccountKind(profile);
  const isInternal = isAiPersonaProfile(profile) || kind === 'demo' || kind === 'ai_persona';
  if (!isInternal) {
    return null;
  }

  const label =
    kind === 'ai_persona' ? t('chat.aiPowered') : ACCOUNT_KIND_LABELS[kind];

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
        {label}
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
