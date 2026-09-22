import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { mockProfiles } from '../../data/profiles';
import { useApp } from '../../context/AppContext';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { assessProfile } from '../../trust/scamDetector';
import {
  clearProfileQuarantine,
  getQuarantinedProfileIds,
  isProfileQuarantined,
  quarantineProfile,
} from '../../trust/scamEnforcementStore';
import type { ScamRiskLevel } from '../../trust/scamTypes';
import { radii, spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminScamDetector'>;
};

type Row = {
  id: string;
  name: string;
  age: number;
  score: number;
  level: ScamRiskLevel;
  quarantined: boolean;
  signalCount: number;
  topSignal?: string;
};

function levelColor(level: ScamRiskLevel): string {
  switch (level) {
    case 'critical':
      return '#E74C3C';
    case 'high':
      return '#E67E22';
    case 'medium':
      return '#F5A623';
    default:
      return '#7F8C8D';
  }
}

export function AdminScamDetectorScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { hasPermission } = useAdmin();
  const { refreshScamEnforcement } = useApp();
  const [refreshKey, setRefreshKey] = useState(0);

  const rows = useMemo((): Row[] => {
    void refreshKey;
    return mockProfiles
      .map((profile) => {
        const assessment = assessProfile(profile);
        return {
          id: profile.id,
          name: profile.name,
          age: profile.age,
          score: assessment.score,
          level: assessment.level,
          quarantined: isProfileQuarantined(profile.id),
          signalCount: assessment.signals.length,
          topSignal: assessment.signals[0]?.excerpt ?? assessment.signals[0]?.id,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [refreshKey]);

  const quarantinedCount = useMemo(() => getQuarantinedProfileIds().length, [refreshKey]);

  const riskyCount = useMemo(
    () => rows.filter((row) => row.level === 'high' || row.level === 'critical').length,
    [rows],
  );

  const toggleQuarantine = useCallback(async (profileId: string, quarantined: boolean) => {
    if (quarantined) {
      await clearProfileQuarantine(profileId);
    } else {
      await quarantineProfile(profileId);
    }
    setRefreshKey((k) => k + 1);
    refreshScamEnforcement();
  }, [refreshScamEnforcement]);

  if (!hasPermission('canRunBackendActions')) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScreenHeader
          title={t('admin.scamDetectorTitle')}
          leftIcon="chevron-back"
          onLeftPress={() => navigation.goBack()}
        />
        <Text style={[styles.denied, { color: colors.textMuted }]}>{t('admin.permissionDeniedBody')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('admin.scamDetectorTitle')}
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />
      <View style={[styles.stats, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.statsLine, { color: colors.text }]}>
          {t('admin.scamDetectorStats', { risky: riskyCount, quarantined: quarantinedCount })}
        </Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('admin.scamDetectorHint')}</Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.rowMain}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.name}, {item.age}
              </Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                ID {item.id} · {item.signalCount} {t('admin.scamSignals')}
                {item.topSignal ? ` · ${item.topSignal}` : ''}
              </Text>
              <View style={styles.badges}>
                <Text style={[styles.badge, { color: levelColor(item.level) }]}>
                  {t(`admin.scamLevel.${item.level}`)} · {item.score}
                </Text>
                {item.quarantined ? (
                  <Text style={[styles.quarantineBadge, { color: '#E74C3C' }]}>
                    {t('admin.scamQuarantined')}
                  </Text>
                ) : null}
              </View>
            </View>
            <AnimatedPressable
              style={[styles.action, { borderColor: colors.border }]}
              onPress={() => void toggleQuarantine(item.id, item.quarantined)}
            >
              <Text style={[styles.actionText, { color: colors.gradientEnd }]}>
                {item.quarantined ? t('admin.scamLiftQuarantine') : t('admin.scamQuarantine')}
              </Text>
            </AnimatedPressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  denied: { padding: spacing.lg, fontSize: 15 },
  stats: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  statsLine: { fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 13, lineHeight: 18 },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowMain: { gap: 4 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },
  badge: { fontSize: 13, fontWeight: '700' },
  quarantineBadge: { fontSize: 13, fontWeight: '700' },
  action: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: { fontSize: 13, fontWeight: '700' },
});
