import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getAdminAllowlist, getAdminDemoPin, getEnvAdminAllowlist } from '../../admin/adminAllowlist';
import { DEFAULT_DEMO_ADMIN_EMAIL } from '../../admin/adminLocalAllowlist';
import { mockProfiles } from '../../data/profiles';
import { AI_PERSONA_IDS } from '../../data/profiles';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdmin } from '../../context/AdminContext';
import { assessProfile, shouldHideProfileFromDiscover } from '../../trust/scamDetector';
import { getQuarantinedProfileIds } from '../../trust/scamEnforcementStore';
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
  const { adminSession, hasPermission } = useAdmin();
  const [overviewTick, setOverviewTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setOverviewTick((tick) => tick + 1);
    }, []),
  );

  const scamOverview = useMemo(() => {
    void overviewTick;
    const risky = mockProfiles.filter((profile) => {
      const assessment = assessProfile(profile);
      return assessment.level === 'high' || assessment.level === 'critical';
    }).length;
    const hidden = mockProfiles.filter((profile) =>
      shouldHideProfileFromDiscover(assessProfile(profile)),
    ).length;
    return { risky, quarantined: getQuarantinedProfileIds().length, hidden };
  }, [overviewTick]);

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
        {hasPermission('canRunBackendActions') ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{t('admin.overviewScamDetector')}</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {t('admin.overviewScamStats', {
                risky: scamOverview.risky,
                quarantined: scamOverview.quarantined,
              })}
            </Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>
              {t('admin.overviewScamHiddenDiscover', { n: scamOverview.hidden })}
            </Text>
            <AnimatedPressable
              style={[styles.linkBtn, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('AdminScamDetector')}
            >
              <Text style={[styles.linkBtnText, { color: colors.gradientEnd }]}>
                {t('admin.overviewOpenScamDetector')}
              </Text>
            </AnimatedPressable>
          </View>
        ) : null}
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
  linkBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkBtnText: { fontSize: 14, fontWeight: '700' },
});
