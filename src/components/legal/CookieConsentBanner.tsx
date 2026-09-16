import { Platform, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

export function CookieConsentBanner() {
  const { colors } = useTheme();
  const { legalConsent, acceptCookieConsent, updatePrivacyPreferences, privacyPreferences, hasOnboarded } =
    useApp();

  // Cookie banner overlaps onboarding CTAs on web — show after onboarding completes.
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
      <Text style={[styles.title, { color: colors.text }]}>Cookies & privacy</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        We use essential cookies to run Spark on web. Optional analytics help us fix bugs. See our
        Privacy Policy for details.
      </Text>
      <View style={styles.actions}>
        <AnimatedPressable style={[styles.button, { borderColor: colors.border }]} onPress={essentialOnly}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Essential only</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.button, styles.primary, { backgroundColor: colors.gradientEnd }]}
          onPress={acceptAll}
        >
          <Text style={styles.primaryText}>Accept</Text>
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
    // Sit above the 72px bottom tab bar so tabs stay tappable on web.
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
