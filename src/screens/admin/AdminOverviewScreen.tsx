import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getAdminAllowlist, getAdminDemoPin, getEnvAdminAllowlist } from '../../admin/adminAllowlist';
import { DEFAULT_DEMO_ADMIN_EMAIL } from '../../admin/adminLocalAllowlist';
import { mockProfiles } from '../../data/profiles';
import { AI_PERSONA_IDS } from '../../data/profiles';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { isSupabaseConfigured } from '../../services/supabase';
import { radii, spacing } from '../../theme';
import { getAppVersionLabel } from '../../constants/buildInfo';
import Constants from 'expo-constants';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminOverview'>;
};

export function AdminOverviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { adminSession } = useAdmin();

  const humanProfiles = mockProfiles.filter(
    (p) => !AI_PERSONA_IDS.has(p.id) && !p.isAiPersona,
  );
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const pinRequired = Boolean(getAdminDemoPin());

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('admin.overviewTitle')}
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />
      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('admin.overviewSession')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{adminSession?.email}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('admin.overviewCatalog')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {t('admin.overviewCatalogStats', {
              human: humanProfiles.length,
              total: mockProfiles.length,
            })}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('admin.overviewStaff')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {t('admin.overviewStaffCount', { n: getAdminAllowlist().length })}
          </Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>
            {getEnvAdminAllowlist().length > 0
              ? t('admin.overviewStaffEnv')
              : t('admin.overviewStaffDefault', { email: DEFAULT_DEMO_ADMIN_EMAIL })}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('admin.backend')}</Text>
          <Text style={[styles.sub, { color: colors.text }]}>
            {isSupabaseConfigured() ? t('admin.supabaseConfigured') : t('admin.supabaseLocal')}
          </Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>
            {t('admin.overviewBuild', { version: getAppVersionLabel(appVersion) })}
          </Text>
          {pinRequired ? (
            <Text style={[styles.sub, { color: colors.textMuted }]}>{t('admin.overviewPinEnabled')}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 13, lineHeight: 18 },
});
