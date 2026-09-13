import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { RelationshipIntent } from '../../types/profile';
import { colors, radii, spacing } from '../../theme';

type Step = 'welcome' | 'rules' | 'location' | 'intent' | 'profile';

const rules = [
  'Be yourself. Use recent photos.',
  'Stay safe. Meet in public first.',
  'Be kind. No harassment or hate.',
  'Report bad behavior — we take it seriously.',
];

const intentOptions: { value: RelationshipIntent; label: string; hint: string }[] = [
  { value: 'long_term', label: 'Long-term partner', hint: 'Ready for something real' },
  { value: 'short_term', label: 'Something casual', hint: 'Keep it light and fun' },
  { value: 'new_friends', label: 'New friends', hint: 'Meet people, no pressure' },
  { value: 'not_sure', label: 'Still figuring it out', hint: 'Open to seeing where it goes' },
];

export function OnboardingFlow() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, user } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [intent, setIntent] = useState<RelationshipIntent>('not_sure');

  const finish = () => {
    const parsedAge = Number.parseInt(age, 10);
    const nextAge = Number.isFinite(parsedAge) && parsedAge >= 18 && parsedAge <= 99
      ? parsedAge
      : user.age;

    completeOnboarding({
      ...user,
      name: name.trim() || user.name,
      bio: bio.trim() || user.bio,
      age: nextAge,
      intent,
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      {step === 'welcome' && (
        <View style={styles.step}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.badge}>
            <Text style={styles.badgeText}>♥</Text>
          </LinearGradient>
          <Text style={styles.title}>Welcome to Spark</Text>
          <Text style={styles.subtitle}>
            Match. Chat. Date. It starts with a drag.
          </Text>
          <Pressable style={styles.appleButton} onPress={() => setStep('rules')}>
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </Pressable>
          <Pressable onPress={() => setStep('rules')}>
            <Text style={styles.link}>Use phone number instead</Text>
          </Pressable>
        </View>
      )}

      {step === 'rules' && (
        <View style={styles.step}>
          <Text style={styles.title}>House Rules</Text>
          <Text style={styles.subtitle}>A few guidelines before you start matching.</Text>
          {rules.map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
          <Pressable style={styles.primaryButton} onPress={() => setStep('location')}>
            <Text style={styles.primaryButtonText}>I agree</Text>
          </Pressable>
        </View>
      )}

      {step === 'location' && (
        <View style={styles.step}>
          <Text style={styles.title}>Enable location</Text>
          <Text style={styles.subtitle}>
            You&apos;ll see people nearby. We never share your exact location.
          </Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapEmoji}>📍</Text>
            <Text style={styles.mapText}>People within 25 miles</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => setStep('intent')}>
            <Text style={styles.primaryButtonText}>Allow location</Text>
          </Pressable>
          <Pressable onPress={() => setStep('intent')}>
            <Text style={styles.link}>Tell me more</Text>
          </Pressable>
        </View>
      )}

      {step === 'intent' && (
        <View style={styles.step}>
          <Text style={styles.title}>What brings you to Spark?</Text>
          <Text style={styles.subtitle}>
            Be honest — it helps us show you people who want the same thing.
          </Text>
          {intentOptions.map((option) => {
            const selected = intent === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.intentCard, selected && styles.intentCardSelected]}
                onPress={() => setIntent(option.value)}
              >
                <Text style={[styles.intentLabel, selected && styles.intentLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={styles.intentHint}>{option.hint}</Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.primaryButton} onPress={() => setStep('profile')}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}

      {step === 'profile' && (
        <View style={styles.step}>
          <Text style={styles.title}>Create your profile</Text>
          <Text style={styles.subtitle}>Photo-first, like the apps you know.</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            placeholder="Your first name"
          />
          <Text style={styles.label}>Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            placeholder="18+"
            keyboardType="number-pad"
          />
          <Text style={styles.label}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.inputMultiline]}
            placeholderTextColor={colors.textMuted}
            placeholder="A line about you"
            multiline
          />
          <Pressable style={styles.primaryButton} onPress={finish}>
            <Text style={styles.primaryButtonText}>Start matching</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  step: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontSize: 32,
    color: colors.text,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  appleButton: {
    backgroundColor: colors.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appleButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ruleBullet: {
    color: colors.gradientEnd,
    fontSize: 18,
  },
  ruleText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  mapPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mapEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  mapText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  intentCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intentCardSelected: {
    borderColor: colors.gradientEnd,
  },
  intentLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  intentLabelSelected: {
    color: colors.gradientEnd,
  },
  intentHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
