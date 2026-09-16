import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus, StyleSheet, Text, View } from 'react-native';

import { DisguiseBrand } from '../disguise/DisguiseBrand';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useSparkScreenProtection } from '../../hooks/useSparkScreenProtection';

/** Hides Spark UI in the app switcher and blocks screenshots when enabled. */
export function PrivacyShield() {
  const { disguiseMode, securitySettings } = useApp();
  const { colors } = useTheme();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useSparkScreenProtection({ disguiseMode, securitySettings });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  const showShield =
    securitySettings.privacyShieldEnabled &&
    !disguiseMode &&
    (appState === 'inactive' || appState === 'background');

  if (!showShield) {
    return null;
  }

  return (
    <View
      style={[styles.shield, { backgroundColor: colors.background }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.brandWrap}>
        <DisguiseBrand size="lg" showTagline />
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Content hidden for your privacy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shield: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandWrap: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
