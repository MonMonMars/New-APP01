import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { SecuritySettings } from '../types/security';
import { isBiometricAvailable } from '../utils/appLock';
import { hashPin, setStoredPinHash, clearStoredPinHash } from '../utils/secureStorage';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type SecuritySettingsScreenProps = {
  onClose: () => void;
};

function SettingRow({
  label,
  hint,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
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
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.gradientEnd }}
      />
    </View>
  );
}

export function SecuritySettingsScreen({ onClose }: SecuritySettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { securitySettings, updateSecuritySettings } = useApp();
  const [pinDraft, setPinDraft] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    void isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const patch = (partial: Partial<SecuritySettings>) => {
    updateSecuritySettings({ ...securitySettings, ...partial });
  };

  const savePin = async () => {
    if (pinDraft.length < 4 || pinDraft.length > 6) {
      Alert.alert('PIN', 'Use 4–6 digits.');
      return;
    }
    const hashed = await hashPin(pinDraft);
    await setStoredPinHash(hashed);
    patch({ pinEnabled: true, appLockEnabled: true });
    setPinDraft('');
    Alert.alert('PIN saved', 'Your app lock PIN is set.');
  };

  const removePin = async () => {
    await clearStoredPinHash();
    patch({ pinEnabled: false });
    setPinDraft('');
    Alert.alert('PIN removed', 'Biometric lock still applies if enabled.');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>Security</Text>
        <DisguiseModeButton />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: colors.surface }]}>
          <Ionicons name="shield-checkmark" size={28} color={colors.gradientEnd} />
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Protect your privacy</Text>
          <Text style={[styles.bannerBody, { color: colors.textMuted }]}>
            App lock, encrypted local storage, and disguise-safe notifications help keep dating
            data off your lock screen and away from shoulder surfers.
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>App lock</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            label="Require unlock for Spark"
            hint="Face ID, Touch ID, or PIN before leaving Pulse"
            value={securitySettings.appLockEnabled}
            onValueChange={(next) => patch({ appLockEnabled: next })}
          />
          <SettingRow
            label="Biometric unlock"
            hint={
              biometricAvailable
                ? 'Use device biometrics when available'
                : 'Not available on this device'
            }
            value={securitySettings.biometricEnabled}
            onValueChange={(next) => patch({ biometricEnabled: next })}
            disabled={!biometricAvailable}
          />
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>PIN fallback</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.pinHint, { color: colors.textMuted }]}>
            {securitySettings.pinEnabled
              ? 'PIN is set. Enter a new PIN below to change it.'
              : 'Optional 4–6 digit PIN if biometrics fail.'}
          </Text>
          <TextInput
            style={[
              styles.pinInput,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
            ]}
            value={pinDraft}
            onChangeText={(value) => setPinDraft(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="New PIN"
            placeholderTextColor={colors.textMuted}
            maxLength={6}
          />
          <View style={styles.pinActions}>
            <AnimatedPressable style={[styles.pinButton, { borderColor: colors.border }]} onPress={savePin}>
              <Text style={[styles.pinButtonText, { color: colors.text }]}>Save PIN</Text>
            </AnimatedPressable>
            {securitySettings.pinEnabled && (
              <AnimatedPressable style={[styles.pinButton, { borderColor: colors.border }]} onPress={removePin}>
                <Text style={[styles.pinButtonText, { color: '#ef4444' }]}>Remove PIN</Text>
              </AnimatedPressable>
            )}
          </View>
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Disguise & session</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            label="Auto-disguise on background"
            hint="Switch to Pulse when you leave the app"
            value={securitySettings.autoDisguiseOnBackground}
            onValueChange={(next) => patch({ autoDisguiseOnBackground: next })}
          />
          <SettingRow
            label="Disguise-safe notifications"
            hint="Neutral Pulse copy on lock screen while disguised"
            value={securitySettings.disguiseSafeNotifications}
            onValueChange={(next) => patch({ disguiseSafeNotifications: next })}
          />
          <SettingRow
            label="Re-lock after 5 minutes"
            hint="Require unlock again after background timeout"
            value={securitySettings.sessionTimeoutMinutes > 0}
            onValueChange={(next) => patch({ sessionTimeoutMinutes: next ? 5 : 0 })}
          />
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Screen protection</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            label="Block screenshots (Spark)"
            hint="Prevent screenshots and screen recording on dating screens"
            value={securitySettings.blockScreenshots}
            onValueChange={(next) => patch({ blockScreenshots: next })}
          />
          <SettingRow
            label="Privacy shield"
            hint="Hide Spark in app switcher with Pulse overlay"
            value={securitySettings.privacyShieldEnabled}
            onValueChange={(next) => patch({ privacyShieldEnabled: next })}
          />
        </View>

        <AnimatedPressable
          style={[styles.protocolLink, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => navigation.getParent()?.navigate('SecurityProtocols')}
        >
          <Ionicons name="shield-half-outline" size={20} color={colors.gradientEnd} />
          <Text style={[styles.protocolLinkText, { color: colors.text }]}>
            Read security protocols — anti-phishing & hacker protection
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </AnimatedPressable>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Local chat data is encrypted on device. Never share your PIN, magic links, or verification
          selfies with anyone claiming to be Spark support.
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
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  banner: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  bannerBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
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
  pinHint: { fontSize: 13, padding: spacing.md, paddingBottom: 0 },
  pinInput: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 18,
    letterSpacing: 6,
    textAlign: 'center',
  },
  pinActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  pinButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pinButtonText: { fontSize: 15, fontWeight: '700' },
  protocolLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  protocolLinkText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  footer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
