import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEGAL_ENTITY } from '../constants/legalEntity';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { LocaleToggle } from '../components/legal/LocaleToggle';
import { getLegalDocumentLinks, getLegalUiStrings, LegalDocumentId } from '../content/legal';
import { useAppLocale } from '../hooks/useAppLocale';
import { useTranslation } from '../i18n';
import { PrivacyPreferences } from '../types/privacy';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type PrivacyCenterScreenProps = {
  onClose: () => void;
};

function PreferenceRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowHint, { color: colors.textMuted }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.gradientEnd }}
      />
    </View>
  );
}

export function PrivacyCenterScreen({ onClose }: PrivacyCenterScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    privacyPreferences,
    updatePrivacyPreferences,
    exportUserData,
    deleteAccount,
    isSparkPlus,
    setIncognitoMode,
  } = useApp();
  const { locale } = useAppLocale();
  const { t } = useTranslation();
  const ui = getLegalUiStrings(locale);
  const policyLinks = getLegalDocumentLinks(locale);

  const patch = (partial: Partial<PrivacyPreferences>) => {
    updatePrivacyPreferences({ ...privacyPreferences, ...partial });
  };

  const openLegal = (documentId: LegalDocumentId) => {
    navigation.getParent()?.navigate('LegalDocument', { documentId });
  };

  const handleExport = async () => {
    const ok = await exportUserData();
    if (!ok) {
      Alert.alert(t('alerts.exportFailed'), t('alerts.exportFailedBody'));
      return;
    }
    Alert.alert(t('alerts.exportReady'), t('alerts.exportReadyBody'));
  };

  const handleDelete = () => {
    Alert.alert(
      t('alerts.deleteAccountTitle'),
      t('alerts.deleteAccountPrivacyBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            void deleteAccount();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>{t('privacy.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: colors.surface }]}>
          <Ionicons name="hand-left-outline" size={28} color={colors.gradientEnd} />
          <Text style={[styles.bannerTitle, { color: colors.text }]}>{t('privacy.bannerTitle')}</Text>
          <Text style={[styles.bannerBody, { color: colors.textMuted }]}>
            {t('privacy.bannerBody')}
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>{t('privacy.dataUse')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PreferenceRow
            label={t('privacy.analytics')}
            hint={t('privacy.analyticsHint')}
            value={privacyPreferences.analyticsEnabled}
            onValueChange={(next) => patch({ analyticsEnabled: next })}
          />
          <PreferenceRow
            label={t('privacy.personalisation')}
            hint={t('privacy.personalisationHint')}
            value={privacyPreferences.personalisationEnabled}
            onValueChange={(next) => patch({ personalisationEnabled: next })}
          />
          <PreferenceRow
            label={t('privacy.marketing')}
            hint={t('privacy.marketingHint')}
            value={privacyPreferences.marketingConsent}
            onValueChange={(next) => patch({ marketingConsent: next })}
          />
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>{t('privacy.visibility')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PreferenceRow
            label={t('privacy.locationSharing')}
            hint={t('privacy.locationSharingHint')}
            value={privacyPreferences.locationSharing}
            onValueChange={(next) => patch({ locationSharing: next })}
          />
          <PreferenceRow
            label={t('privacy.activeStatus')}
            hint={t('privacy.activeStatusHint')}
            value={privacyPreferences.showActiveStatus}
            onValueChange={(next) => patch({ showActiveStatus: next })}
          />
          <PreferenceRow
            label={t('privacy.incognito')}
            hint={
              isSparkPlus
                ? t('privacy.incognitoHintSparkPlus')
                : t('privacy.incognitoHintUpgrade')
            }
            value={privacyPreferences.incognitoMode && isSparkPlus}
            onValueChange={(next) => {
              if (next && !setIncognitoMode(true)) {
                navigation.getParent()?.navigate('SparkPlus');
                return;
              }
              if (!next) {
                setIncognitoMode(false);
              }
            }}
          />
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>{t('privacy.yourRights')}</Text>
        <AnimatedPressable
          style={[styles.actionRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => void handleExport()}
        >
          <Ionicons name="download-outline" size={22} color={colors.gradientEnd} />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('privacy.downloadData')}</Text>
            <Text style={[styles.actionHint, { color: colors.textMuted }]}>
              {t('privacy.downloadDataHint')}
            </Text>
          </View>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.actionRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() =>
            Alert.alert(
              t('alerts.dataSubjectTitle'),
              t('alerts.dataSubjectBody', { email: LEGAL_ENTITY.privacyEmail }),
            )
          }
        >
          <Ionicons name="mail-outline" size={22} color={colors.gradientEnd} />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('privacy.requestAccess')}</Text>
            <Text style={[styles.actionHint, { color: colors.textMuted }]}>
              {t('privacy.requestAccessHint')}
            </Text>
          </View>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.actionRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={22} color="#ef4444" />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: '#ef4444' }]}>{t('privacy.deleteAccount')}</Text>
            <Text style={[styles.actionHint, { color: colors.textMuted }]}>
              {t('privacy.deleteAccountHint')}
            </Text>
          </View>
        </AnimatedPressable>

        <Text style={[styles.section, { color: colors.textMuted }]}>{ui.languageSection}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: spacing.lg }]}>
          <View style={[styles.languageRow, { borderBottomColor: colors.border }]}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{ui.privacyLanguage}</Text>
              <Text style={[styles.rowHint, { color: colors.textMuted }]}>{ui.privacyLanguageHint}</Text>
            </View>
            <LocaleToggle compact />
          </View>
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>
          {t('privacy.policies')}
        </Text>
        {policyLinks.map((item) => (
          <AnimatedPressable
            key={item.id}
            style={[styles.linkRow, { borderBottomColor: colors.border }]}
            onPress={() => openLegal(item.id)}
          >
            <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.textMuted} />
            <Text style={[styles.linkLabel, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </AnimatedPressable>
        ))}

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          {t('privacy.controller', { name: LEGAL_ENTITY.name, email: LEGAL_ENTITY.privacyEmail })}
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
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  banner: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', marginTop: spacing.sm },
  bannerBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: spacing.sm },
  section: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowHint: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionHint: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linkLabel: { flex: 1, fontSize: 16 },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.lg },
});
