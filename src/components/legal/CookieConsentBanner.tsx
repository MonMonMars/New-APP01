import { Platform, StyleSheet, Text, View } from 'react-native';

import { getLegalUiStrings, LegalDocumentId } from '../../content/legal';
import { useApp } from '../../context/AppContext';
import { useAppLocale } from '../../hooks/useAppLocale';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type CookieConsentBannerProps = {
  onOpenLegal?: (documentId: LegalDocumentId) => void;
};

export function CookieConsentBanner({ onOpenLegal }: CookieConsentBannerProps) {
  const { colors } = useTheme();
  const { locale } = useAppLocale();
  const ui = getLegalUiStrings(locale);
  const { legalConsent, acceptCookieConsent, updatePrivacyPreferences, privacyPreferences, hasOnboarded } =
    useApp();

  if (Platform.OS !== 'web' || legalConsent.cookieConsentAt || !hasOnboarded) {
    return null;
  }

  const acceptAll = () => {
    updatePrivacyPreferences({
      ...privacyPreferences,
      analyticsEnabled: true,
      personalisationEnabled: true,
    });
    acceptCookieConsent();
  };

  const essentialOnly = () => {
    updatePrivacyPreferences({
      ...privacyPreferences,
      analyticsEnabled: false,
      personalisationEnabled: privacyPreferences.personalisationEnabled,
    });
    acceptCookieConsent();
  };

  return (
    <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{ui.cookieTitle}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        {ui.cookieBodyPrefix}{' '}
        <Text
          style={[styles.link, { color: colors.gradientEnd }]}
          onPress={() => onOpenLegal?.('cookies')}
        >
          {ui.cookiePolicyLink}
        </Text>{' '}
        {ui.cookieAnd}{' '}
        <Text
          style={[styles.link, { color: colors.gradientEnd }]}
          onPress={() => onOpenLegal?.('privacy')}
        >
          {ui.privacyPolicyLink}
        </Text>
        {locale === 'zh-TW' ? '。' : '.'}
      </Text>
      <View style={styles.actions}>
        <AnimatedPressable style={[styles.button, { borderColor: colors.border }]} onPress={essentialOnly}>
          <Text style={[styles.buttonText, { color: colors.text }]}>{ui.cookieEssentialOnly}</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.button, styles.primary, { backgroundColor: colors.gradientEnd }]}
          onPress={acceptAll}
        >
          <Text style={styles.primaryText}>{ui.cookieAccept}</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 88,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { fontSize: 15, fontWeight: '800', marginBottom: spacing.xs },
  body: { fontSize: 13, lineHeight: 18, marginBottom: spacing.md },
  link: { fontWeight: '700', textDecorationLine: 'underline' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  button: {
    flex: 1,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  primary: { borderWidth: 0 },
  buttonText: { fontSize: 14, fontWeight: '700' },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
