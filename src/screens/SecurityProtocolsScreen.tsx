import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEGAL_ENTITY } from '../constants/legalEntity';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type SecurityProtocolsScreenProps = {
  onClose: () => void;
};

const PROTOCOL_IDS = [
  'appLock',
  'disguise',
  'encryption',
  'screenshot',
  'report',
  'loginLinks',
  'apiKeys',
  'sessionTimeout',
] as const;

const PROTOCOL_ICONS: Record<(typeof PROTOCOL_IDS)[number], keyof typeof Ionicons.glyphMap> = {
  appLock: 'key-outline',
  disguise: 'eye-off-outline',
  encryption: 'shield-checkmark-outline',
  screenshot: 'camera-outline',
  report: 'warning-outline',
  loginLinks: 'link-outline',
  apiKeys: 'cloud-offline-outline',
  sessionTimeout: 'refresh-outline',
};

export function SecurityProtocolsScreen({ onClose }: SecurityProtocolsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back} accessibilityLabel={t('common.close')}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>{t('securityProtocols.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: colors.surface }]}>
          <Ionicons name="lock-closed" size={28} color={colors.gradientEnd} />
          <Text style={[styles.bannerTitle, { color: colors.text }]}>{t('securityProtocols.bannerTitle')}</Text>
          <Text style={[styles.bannerBody, { color: colors.textMuted }]}>{t('securityProtocols.bannerBody')}</Text>
        </View>

        {PROTOCOL_IDS.map((id) => (
          <View
            key={id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name={PROTOCOL_ICONS[id]} size={22} color={colors.gradientEnd} />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {t(`securityProtocols.${id}.title`)}
              </Text>
              <Text style={[styles.cardBody, { color: colors.textMuted }]}>
                {t(`securityProtocols.${id}.body`)}
              </Text>
            </View>
          </View>
        ))}

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          {t('securityProtocols.footer', { email: LEGAL_ENTITY.securityEmail })}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  banner: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  bannerBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardBody: { fontSize: 13, lineHeight: 18 },
  footer: { fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: spacing.md },
});
