import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';

export function IncognitoBanner() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.gradientEnd }]}>
      <Ionicons name="eye-off" size={16} color={colors.gradientEnd} />
      <Text style={[styles.text, { color: colors.text }]}>{t('discover.incognitoOn')}</Text>
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
    borderRadius: radii.button,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
