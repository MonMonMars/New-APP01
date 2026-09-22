import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';

type BoostBannerProps = {
  visible: boolean;
};

export function BoostBanner({ visible }: BoostBannerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: `${colors.boost}26`, borderColor: colors.boost }]}>
      <Ionicons name="flash" size={16} color={colors.boost} />
      <Text style={[styles.text, { color: colors.text }]}>
        {t('boost.activeBanner')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.card,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});
