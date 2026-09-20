import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { colors, radii, spacing } from '../../theme';
import { pulseBrand } from '../../theme/pulseBrand';
import { signInWithApple } from '../../utils/appleAuth';
import { AnimatedPressable } from '../AnimatedPressable';

type AuthWelcomePanelProps = {
  authLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
  onAuthenticated: () => void;
  onGuest: () => void;
  email: string;
  setEmail: (value: string) => void;
  emailMessage: string | null;
  setEmailMessage: (value: string | null) => void;
  awaitingMagicLink: boolean;
  setAwaitingMagicLink: (value: boolean) => void;
  onRefreshMagicLink: () => void;
};

type AuthTab = 'email' | 'phone' | 'password';

export function AuthWelcomePanel({
  authLoading,
  setAuthLoading,
  onAuthenticated,
  onGuest,
  email,
  setEmail,
  emailMessage,
  setEmailMessage,
  awaitingMagicLink,
  setAwaitingMagicLink,
  onRefreshMagicLink,
}: AuthWelcomePanelProps) {
  const { t } = useTranslation();
  const {
    signInWithAppleStub,
    signInWithEmailMagicLink,
    signInWithGoogle,
    signInWithPhoneOtp,
    verifyPhoneSignIn,
    signUpWithPassword,
    signInWithPassword,
    isSupabaseEnabled,
  } = useApp();

  const [tab, setTab] = useState<AuthTab>('email');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneSent, setPhoneSent] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordMode, setPasswordMode] = useState<'signIn' | 'signUp'>('signIn');

  const handleApple = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithApple();
      if (result.success) {
        await signInWithAppleStub(result.identityToken, result.displayName);
        onAuthenticated();
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogle = async () => {
    setAuthLoading(true);
    setEmailMessage(null);
    try {
      const result = await signInWithGoogle();
      setEmailMessage(result.message);
      if (result.ok && !isSupabaseEnabled) {
        onAuthenticated();
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailMagic = async () => {
    setAuthLoading(true);
    setEmailMessage(null);
    try {
      const result = await signInWithEmailMagicLink(email);
      setEmailMessage(result.message);
      if (result.ok) {
        if (isSupabaseEnabled) {
          setAwaitingMagicLink(true);
        } else {
          onAuthenticated();
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePhoneSend = async () => {
    setAuthLoading(true);
    setEmailMessage(null);
    try {
      const result = await signInWithPhoneOtp(phone);
      setEmailMessage(result.message);
      if (result.ok) {
        setPhoneSent(true);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    setAuthLoading(true);
    setEmailMessage(null);
    try {
      const result = await verifyPhoneSignIn(phone, phoneCode);
      setEmailMessage(result.message);
      if (result.ok) {
        onAuthenticated();
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePassword = async () => {
    setAuthLoading(true);
    setEmailMessage(null);
    try {
      const result =
        passwordMode === 'signUp'
          ? await signUpWithPassword(email, password)
          : await signInWithPassword(email, password);
      setEmailMessage(result.message);
      if (result.ok) {
        onAuthenticated();
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <AnimatedPressable style={styles.appleButton} onPress={() => void handleApple()} disabled={authLoading}>
        {authLoading ? (
          <ActivityIndicator color={colors.textDark} />
        ) : (
          <>
            <Ionicons name="logo-apple" size={20} color={colors.textDark} />
            <Text style={styles.appleButtonText}>{t('onboarding.continueApple')}</Text>
          </>
        )}
      </AnimatedPressable>

      <AnimatedPressable style={styles.googleButton} onPress={() => void handleGoogle()} disabled={authLoading}>
        <Ionicons name="logo-google" size={18} color={colors.textDark} />
        <Text style={styles.googleButtonText}>{t('auth.continueGoogle')}</Text>
      </AnimatedPressable>

      <View style={styles.tabRow}>
        {(['email', 'phone', 'password'] as const).map((key) => (
          <AnimatedPressable
            key={key}
            style={[styles.tabChip, tab === key && styles.tabChipActive]}
            onPress={() => {
              setTab(key);
              setEmailMessage(null);
            }}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {key === 'email' ? t('auth.tabEmail') : key === 'phone' ? t('auth.tabPhone') : t('auth.tabPassword')}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      {tab === 'email' ? (
        <View style={styles.emailBlock}>
          <TextInput
            style={styles.emailInput}
            placeholder={t('onboarding.emailPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AnimatedPressable
            style={styles.emailButton}
            onPress={() => void handleEmailMagic()}
            disabled={authLoading || !email.trim()}
          >
            <Ionicons name="mail-outline" size={18} color={colors.text} />
            <Text style={styles.emailButtonText}>{t('onboarding.continueEmail')}</Text>
          </AnimatedPressable>
          {awaitingMagicLink ? (
            <AnimatedPressable style={styles.emailButton} disabled={authLoading} onPress={onRefreshMagicLink}>
              <Ionicons name="refresh-outline" size={18} color={colors.text} />
              <Text style={styles.emailButtonText}>{t('onboarding.magicLinkRefresh')}</Text>
            </AnimatedPressable>
          ) : null}
        </View>
      ) : null}

      {tab === 'phone' ? (
        <View style={styles.emailBlock}>
          <TextInput
            style={styles.emailInput}
            placeholder={t('auth.phonePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {!phoneSent ? (
            <AnimatedPressable
              style={styles.emailButton}
              onPress={() => void handlePhoneSend()}
              disabled={authLoading || phone.trim().length < 8}
            >
              <Ionicons name="chatbox-outline" size={18} color={colors.text} />
              <Text style={styles.emailButtonText}>{t('auth.sendPhoneCode')}</Text>
            </AnimatedPressable>
          ) : (
            <>
              <TextInput
                style={styles.emailInput}
                placeholder={t('auth.phoneCodePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={phoneCode}
                onChangeText={setPhoneCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <AnimatedPressable
                style={styles.emailButton}
                onPress={() => void handlePhoneVerify()}
                disabled={authLoading || phoneCode.trim().length < 4}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.text} />
                <Text style={styles.emailButtonText}>{t('auth.verifyPhoneCode')}</Text>
              </AnimatedPressable>
            </>
          )}
        </View>
      ) : null}

      {tab === 'password' ? (
        <View style={styles.emailBlock}>
          <View style={styles.tabRow}>
            {(['signIn', 'signUp'] as const).map((mode) => (
              <AnimatedPressable
                key={mode}
                style={[styles.tabChip, passwordMode === mode && styles.tabChipActive]}
                onPress={() => setPasswordMode(mode)}
              >
                <Text style={[styles.tabText, passwordMode === mode && styles.tabTextActive]}>
                  {mode === 'signIn' ? t('auth.signIn') : t('auth.signUp')}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
          <TextInput
            style={styles.emailInput}
            placeholder={t('onboarding.emailPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.emailInput}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <AnimatedPressable
            style={styles.emailButton}
            onPress={() => void handlePassword()}
            disabled={authLoading || !email.trim() || password.length < 8}
          >
            <Ionicons name="key-outline" size={18} color={colors.text} />
            <Text style={styles.emailButtonText}>
              {passwordMode === 'signIn' ? t('auth.signIn') : t('auth.signUp')}
            </Text>
          </AnimatedPressable>
        </View>
      ) : null}

      {emailMessage ? <Text style={styles.emailHint}>{emailMessage}</Text> : null}

      <AnimatedPressable onPress={onGuest}>
        <Text style={styles.link}>{t('onboarding.continueGuest')}</Text>
      </AnimatedPressable>
    </>
  );
}

const styles = StyleSheet.create({
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  appleButtonText: {
    color: colors.textDark,
    fontWeight: '700',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  googleButtonText: {
    color: colors.textDark,
    fontWeight: '700',
    fontSize: 16,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tabChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: pulseBrand.accentSoft,
    borderColor: pulseBrand.accent,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: pulseBrand.accent,
  },
  emailBlock: {
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.sm,
  },
  emailInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  emailButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  emailHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  link: {
    color: pulseBrand.accent,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
