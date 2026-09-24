import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import {
  fetchModerationQueue,
  updateReportStatus,
  type SecurityReportRow,
} from '../../services/trustSafety';
import { quarantineProfile } from '../../trust/scamEnforcementStore';
import { radii, spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminModerationQueue'>;
};

export function AdminModerationQueueScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [rows, setRows] = useState<SecurityReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await fetchModerationQueue();
    if (!result.ok) {
      setError(result.error ?? t('admin.moderationLoadFailed'));
      setRows([]);
      return;
    }
    setError(null);
    setRows(result.rows);
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const setStatus = async (reportId: string, status: 'reviewing' | 'resolved' | 'dismissed') => {
    setBusyId(reportId);
    const result = await updateReportStatus(reportId, status);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error ?? t('admin.moderationUpdateFailed'));
      return;
    }
    await load();
  };

  const quarantineFromReport = async (profileId: string, reportId: string) => {
    setBusyId(reportId);
    await quarantineProfile(profileId);
    await setStatus(reportId, 'resolved');
    setBusyId(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('admin.moderationTitle')}
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.gradientEnd} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
        >
          <Text style={[styles.lead, { color: colors.textMuted }]}>{t('admin.moderationLead')}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {rows.length === 0 && !error ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>{t('admin.moderationEmpty')}</Text>
          ) : null}
          {rows.map((row) => (
            <View
              key={row.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {row.context} · {new Date(row.created_at).toLocaleString()}
              </Text>
              <Text style={[styles.profileId, { color: colors.text }]}>
                {t('admin.moderationReportedProfile', { id: row.reported_profile_id })}
              </Text>
              <Text style={[styles.reason, { color: colors.text }]}>{row.reason}</Text>
              <Text style={[styles.status, { color: colors.gradientEnd }]}>{row.status}</Text>
              <View style={styles.actions}>
                <AnimatedPressable
                  style={[styles.chip, { borderColor: colors.border }]}
                  disabled={busyId === row.id}
                  onPress={() => void setStatus(row.id, 'reviewing')}
                >
                  <Text style={{ color: colors.text }}>{t('admin.moderationReviewing')}</Text>
                </AnimatedPressable>
                <AnimatedPressable
                  style={[styles.chip, { borderColor: colors.border }]}
                  disabled={busyId === row.id}
                  onPress={() => void setStatus(row.id, 'dismissed')}
                >
                  <Text style={{ color: colors.textMuted }}>{t('admin.moderationDismiss')}</Text>
                </AnimatedPressable>
                <AnimatedPressable
                  style={[styles.chipPrimary, { backgroundColor: colors.gradientEnd }]}
                  disabled={busyId === row.id}
                  onPress={() => void quarantineFromReport(row.reported_profile_id, row.id)}
                >
                  <Text style={styles.chipPrimaryText}>{t('admin.moderationQuarantine')}</Text>
                </AnimatedPressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { marginTop: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  lead: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  error: { color: '#ef4444', marginBottom: spacing.md, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  card: {
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  meta: { fontSize: 12, marginBottom: spacing.xs },
  profileId: { fontSize: 15, fontWeight: '800', marginBottom: spacing.xs },
  reason: { fontSize: 14, lineHeight: 20, marginBottom: spacing.sm },
  status: { fontSize: 12, fontWeight: '700', marginBottom: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipPrimary: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
