import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
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
      <Ionicons name="pulse" size={48} color="#3b82f6" />
      <Text style={[styles.title, { color: colors.text }]}>{DISGUISE_APP_NAME}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Content hidden for your privacy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shield: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
