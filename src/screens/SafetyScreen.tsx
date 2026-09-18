import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { getLegalDocumentLinks, getLegalUiStrings, LegalDocumentId } from '../content/legal';
import { useTranslation } from '../i18n';
import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { SafetyResourceSheet } from '../components/SafetyResourceSheet';

type SafetyScreenProps = {
  onClose: () => void;
};

const legalDocIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'document-text-outline': 'document-text-outline',
  'lock-closed-outline': 'lock-closed-outline',
  'people-outline': 'people-outline',
  'eye-off-outline': 'eye-off-outline',
  'shield-checkmark-outline': 'shield-checkmark-outline',
  'nutrition-outline': 'nutrition-outline',
  'card-outline': 'card-outline',
  'medkit-outline': 'medkit-outline',
};

export function SafetyScreen({ onClose }: SafetyScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { blockedProfiles, unblockProfile } = useApp();
  const { t, locale } = useTranslation();
  const ui = getLegalUiStrings(locale);
  const legalLinks = getLegalDocumentLinks(locale);
  const [resourceSheet, setResourceSheet] = useState<{ title: string; body: string } | null>(null);

  const tips = useMemo(
    () => [
      {
        icon: 'location' as const,
        title: t('safety.meetPublic'),
        body: t('safety.meetPublicBody'),
      },
      {
        icon: 'shield-checkmark' as const,
        title: t('safety.trustInstincts'),
        body: t('safety.trustInstinctsBody'),
      },
      {
        icon: 'lock-closed' as const,
        title: t('safety.protectInfo'),
        body: t('safety.protectInfoBody'),
      },
      {
        icon: 'videocam' as const,
        title: t('safety.videoFirst'),
        body: t('safety.videoFirstBody'),
      },
      {
        icon: 'calendar' as const,
        title: t('safety.dateCheckIn'),
        body: t('safety.dateCheckInBody'),
      },
    ],
    [t],
  );

  const resources = useMemo(
    () => [
      {
        id: 'report-profile',
        label: t('safety.reportProfile'),
        icon: 'flag-outline' as const,
        message: t('safety.reportProfileBody'),
      },
      {
        id: 'block-someone',
        label: t('safety.blockSomeone'),
        icon: 'hand-left-outline' as const,
        message: t('safety.blockSomeoneBody'),
      },
      {
        id: 'safety-faq',
        label: t('safety.safetyFaq'),
        icon: 'book-outline' as const,
        message: t('safety.safetyFaqBody'),
      },
      {
        id: 'contact-support',
        label: t('safety.contactSupport'),
        icon: 'mail-outline' as const,
        message: t('safety.contactSupportBody'),
      },
      {
        id: 'verification-policy',
        label: t('safety.verificationPolicy'),
        icon: 'shield-checkmark-outline' as const,
        action: 'verification-policy' as const,
      },
      {
        id: 'security-settings',
        label: t('safety.securitySettings'),
        icon: 'lock-closed-outline' as const,
        action: 'security-settings' as const,
      },
      {
        id: 'privacy-center',
        label: t('safety.privacyControls'),
        icon: 'hand-left-outline' as const,
        action: 'privacy-center' as const,
      },
      {
        id: 'security-protocols',
        label: t('safety.securityProtocols'),
        icon: 'shield-half-outline' as const,
        action: 'security-protocols' as const,
      },
    ],
    [t],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>{t('safety.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={32} color={colors.like} />
          <Text style={styles.bannerTitle}>{t('safety.bannerTitle')}</Text>
          <Text style={styles.bannerBody}>
            {t('safety.bannerBody')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t('safety.tipsTitle')}</Text>
        {tips.map((tip) => (
          <View key={tip.title} style={styles.tipCard}>
            <Ionicons name={tip.icon} size={24} color={colors.gradientEnd} />
            <View style={styles.tipText}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipBody}>{tip.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{t('safety.legalPoliciesTitle')}</Text>
        <Text style={styles.legalIntro}>{ui.safetyLegalIntro}</Text>
        {legalLinks.map((item) => (
          <AnimatedPressable
            key={item.id}
            style={styles.resourceRow}
            onPress={() => {
              if (item.id === 'verification') {
                navigation.getParent()?.navigate('VerificationPolicy');
                return;
              }
              navigation.getParent()?.navigate('LegalDocument', { documentId: item.id as LegalDocumentId });
            }}
          >
            <Ionicons
              name={legalDocIconMap[item.icon] ?? 'document-outline'}
              size={22}
              color={colors.textMuted}
            />
            <Text style={styles.resourceLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </AnimatedPressable>
        ))}

        {blockedProfiles.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{t('safety.blockedUsers')}</Text>
            {blockedProfiles.map((profile) => (
              <View key={profile.id} style={styles.blockedRow}>
                <Text style={styles.blockedName}>{profile.name}</Text>
                <AnimatedPressable
                  onPress={() => {
                    unblockProfile(profile.id);
                    Alert.alert(
                      t('safety.unblocked'),
                      t('safety.unblockedBody', { name: profile.name }),
                    );
                  }}
                >
                  <Text style={[styles.unblockText, { color: colors.gradientEnd }]}>
                    {t('common.unblock')}
                  </Text>
                </AnimatedPressable>
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>{t('safety.quickActions')}</Text>
        {resources.map((item) => (
          <AnimatedPressable
            key={item.id}
            style={styles.resourceRow}
            onPress={() => {
              if ('action' in item && item.action === 'verification-policy') {
                navigation.getParent()?.navigate('VerificationPolicy');
                return;
              }
              if ('action' in item && item.action === 'security-settings') {
                navigation.getParent()?.navigate('SecuritySettings');
                return;
              }
              if ('action' in item && item.action === 'privacy-center') {
                navigation.getParent()?.navigate('PrivacyCenter');
                return;
              }
              if ('action' in item && item.action === 'security-protocols') {
                navigation.getParent()?.navigate('SecurityProtocols');
                return;
              }
              if ('message' in item && item.message) {
                setResourceSheet({ title: item.label, body: item.message });
              }
            }}
          >
            <Ionicons name={item.icon} size={22} color={colors.textMuted} />
            <Text style={styles.resourceLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </AnimatedPressable>
        ))}
      </ScrollView>

      <SafetyResourceSheet
        visible={resourceSheet !== null}
        title={resourceSheet?.title ?? ''}
        body={resourceSheet?.body ?? ''}
        onClose={() => setResourceSheet(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  banner: {
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  bannerBody: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  tipBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
  },
  resourceLabel: {
    flex: 1,
    color: palette.text,
    fontSize: 16,
  },
  legalIntro: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  legalLabelWrap: {
    flex: 1,
  },
  legalLabelZh: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
  },
  blockedName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  unblockText: {
    color: palette.gradientEnd,
    fontSize: 14,
    fontWeight: '700',
  },
});
