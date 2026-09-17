import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LegalPreviewSheet } from '../../components/legal/LegalPreviewSheet';
import { PhotoCarousel } from '../../components/PhotoCarousel';
import { LegalDocumentId } from '../../content/legalDocuments';
import { useApp } from '../../context/AppContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import {
  GENDER_LABELS,
  ORIENTATION_LABELS,
  Orientation,
  ProfileGender,
  RelationshipIntent,
} from '../../types/profile';
import { signInWithApple } from '../../utils/appleAuth';
import { pickProfilePhoto } from '../../utils/photoPicker';
import { colors, radii, spacing } from '../../theme';
import { pulseBrand } from '../../theme/pulseBrand';
import { AnimatedPressable } from '../../components/AnimatedPressable';

type Step = 'welcome' | 'rules' | 'location' | 'intent' | 'identity' | 'profile';

const rules = [
  'Be honest — use your own recent photos and accurate age.',
  'Be respectful — no harassment, hate speech, or unwanted contact.',
  'Stay safe — meet in public and report suspicious behaviour.',
  '18+ only — one person, one account.',
];

const intentOptions: { value: RelationshipIntent; label: string; hint: string }[] = [
  { value: 'long_term', label: 'Tech & business', hint: 'Startups, markets, product news' },
  { value: 'short_term', label: 'Local & city life', hint: 'Transit, events, neighborhood updates' },
  { value: 'new_friends', label: 'Food & lifestyle', hint: 'Recipes, culture, weekend ideas' },
  { value: 'not_sure', label: 'Mix of everything', hint: 'A balanced home feed' },
];

export function OnboardingFlow() {
  const insets = useSafeAreaInsets();
  const {
    completeOnboarding,
    signInWithAppleStub,
    signInWithEmailMagicLink,
    acceptOnboardingLegal,
    updatePreferences,
    preferences,
    user,
  } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalPreviewId, setLegalPreviewId] = useState<LegalDocumentId | null>(null);
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [intent, setIntent] = useState<RelationshipIntent>('not_sure');
  const [gender, setGender] = useState<ProfileGender>('woman');
  const [orientation, setOrientation] = useState<Orientation>('straight');
  const [photos, setPhotos] = useState<string[]>(user.photos);
  const [authLoading, setAuthLoading] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);

  const genderOptions: ProfileGender[] = ['woman', 'man', 'nonbinary'];
  const orientationOptions: Orientation[] = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'queer', 'asexual', 'other'];

  const handleEmailSignIn = async () => {
    setAuthLoading(true);
    setEmailMessage(null);
    try {
      const result = await signInWithEmailMagicLink(email);
      setEmailMessage(result.message);
      if (result.ok) {
        setStep('rules');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithApple();
      if (result.success) {
        await signInWithAppleStub(result.identityToken, result.displayName);
        if (result.displayName) {
          setName(result.displayName);
        }
        setStep('rules');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    const uri = await pickProfilePhoto();
    if (uri) {
      setPhotos((prev) => [...prev, uri]);
    }
  };

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
      gender,
      orientation,
      photos: photos.length > 0 ? photos : user.photos,
      ageVerified: nextAge >= 18,
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      {step === 'welcome' && (
        <View style={styles.step}>
          <View style={styles.badge}>
            <Ionicons name="pulse" size={36} color={pulseBrand.accent} />
          </View>
          <Text style={styles.title}>Welcome to {DISGUISE_APP_NAME}</Text>
          <Text style={styles.subtitle}>
            News, trending topics, and updates from people you follow.
          </Text>
          <AnimatedPressable
            style={styles.appleButton}
            onPress={handleAppleSignIn}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color={colors.textDark} />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color={colors.textDark} />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </>
            )}
          </AnimatedPressable>
          <View style={styles.emailBlock}>
            <TextInput
              style={styles.emailInput}
              placeholder="Email for magic link"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AnimatedPressable
              style={styles.emailButton}
              onPress={handleEmailSignIn}
              disabled={authLoading || !email.trim()}
            >
              <Ionicons name="mail-outline" size={18} color={colors.text} />
              <Text style={styles.emailButtonText}>Continue with email</Text>
            </AnimatedPressable>
            {emailMessage && <Text style={styles.emailHint}>{emailMessage}</Text>}
          </View>
          <AnimatedPressable onPress={() => { signInWithAppleStub(); setStep('rules'); }}>
            <Text style={styles.link}>Continue without account</Text>
          </AnimatedPressable>
        </View>
      )}

      {step === 'rules' && (
        <ScrollView
          style={styles.stepScroll}
          contentContainerStyle={styles.stepScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Community guidelines</Text>
          <Text style={styles.subtitle}>A few rules before you join the feed.</Text>
          {rules.map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
          <Text style={styles.legalNote}>
            I agree to Spark&apos;s{' '}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('terms')}>
              Terms
            </Text>
            ,{' '}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('privacy')}>
              Privacy Policy
            </Text>
            ,{' '}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('community')}>
              Community Guidelines
            </Text>
            ,{' '}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('disguise')}>
              Disguise Mode Policy
            </Text>
            , and{' '}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('safety')}>
              Safety Disclaimer
            </Text>
            . I am 18 or older.
          </Text>
          <AnimatedPressable
            style={[styles.checkboxRow, legalAccepted && styles.checkboxRowActive]}
            onPress={() => setLegalAccepted((v) => !v)}
          >
            <Ionicons
              name={legalAccepted ? 'checkbox' : 'square-outline'}
              size={22}
              color={legalAccepted ? pulseBrand.accent : colors.textMuted}
            />
            <Text style={styles.checkboxLabel}>
              I have read and agree to the policies above, including the Safety Disclaimer
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={[styles.primaryButton, !legalAccepted && styles.primaryButtonDisabled]}
            onPress={() => {
              acceptOnboardingLegal();
              setStep('location');
            }}
            disabled={!legalAccepted}
          >
            <Text style={styles.primaryButtonText}>Continue — I am 18+</Text>
          </AnimatedPressable>
        </ScrollView>
      )}

      {step === 'location' && (
        <View style={styles.step}>
          <Text style={styles.title}>Choose your region</Text>
          <Text style={styles.subtitle}>
            Local headlines and trending topics for your area. We never share your exact location.
          </Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapEmoji}>📍</Text>
            <Text style={styles.mapText}>Top stories near you</Text>
          </View>
          <AnimatedPressable
            style={styles.primaryButton}
            onPress={() => {
              updatePreferences({ ...preferences, passportCity: 'New York, NY' });
              setStep('intent');
            }}
          >
            <Text style={styles.primaryButtonText}>Use my location</Text>
          </AnimatedPressable>
          {showLocationInfo ? (
            <Text style={styles.locationInfo}>
              We use your region for local headlines — never exact GPS. Change anytime in Profile → Discovery preferences.
            </Text>
          ) : null}
          <AnimatedPressable onPress={() => setShowLocationInfo((v) => !v)}>
            <Text style={styles.link}>{showLocationInfo ? 'Hide details' : 'Tell me more'}</Text>
          </AnimatedPressable>
        </View>
      )}

      {step === 'intent' && (
        <View style={styles.step}>
          <Text style={styles.title}>Personalize your feed</Text>
          <Text style={styles.subtitle}>
            Pick what you want to see more of in your timeline.
          </Text>
          {intentOptions.map((option) => {
            const selected = intent === option.value;
            return (
              <AnimatedPressable
                key={option.value}
                style={[styles.intentCard, selected && styles.intentCardSelected]}
                onPress={() => setIntent(option.value)}
              >
                <Text style={[styles.intentLabel, selected && styles.intentLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={styles.intentHint}>{option.hint}</Text>
              </AnimatedPressable>
            );
          })}
          <AnimatedPressable style={styles.primaryButton} onPress={() => setStep('identity')}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </AnimatedPressable>
        </View>
      )}

      {step === 'identity' && (
        <View style={styles.step}>
          <Text style={styles.title}>Your public profile</Text>
          <Text style={styles.subtitle}>
            How you appear on Pulse. Spark safe mode uses this privately when you leave Pulse.
          </Text>

          <Text style={styles.label}>I am a</Text>
          <View style={styles.chipRow}>
            {genderOptions.map((option) => {
              const selected = gender === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {GENDER_LABELS[option]}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={styles.label}>My orientation</Text>
          <View style={styles.chipRow}>
            {orientationOptions.map((option) => {
              const selected = orientation === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setOrientation(option)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {ORIENTATION_LABELS[option]}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <AnimatedPressable style={styles.primaryButton} onPress={() => setStep('profile')}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </AnimatedPressable>
        </View>
      )}

      {step === 'profile' && (
        <View style={styles.step}>
          <Text style={styles.title}>Create your profile</Text>
          <Text style={styles.subtitle}>Add a photo so friends recognize you.</Text>

          <PhotoCarousel
            photos={photos}
            onAddPhoto={handleAddPhoto}
            editable
            height={200}
          />

          <AnimatedPressable style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Ionicons name="camera-outline" size={18} color={pulseBrand.accent} />
            <Text style={styles.addPhotoText}>Add photos</Text>
          </AnimatedPressable>

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
          <AnimatedPressable style={styles.primaryButton} onPress={finish}>
            <Text style={styles.primaryButtonText}>Open {DISGUISE_APP_NAME}</Text>
          </AnimatedPressable>
        </View>
      )}

      <LegalPreviewSheet
        visible={legalPreviewId !== null}
        documentId={legalPreviewId}
        onClose={() => setLegalPreviewId(null)}
      />
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
  stepScroll: {
    flex: 1,
  },
  stepScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(59,130,246,0.15)',
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
    flexDirection: 'row',
    backgroundColor: colors.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
  locationInfo: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ruleBullet: {
    color: pulseBrand.accent,
    fontSize: 18,
  },
  ruleText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  legalNote: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  legalLink: {
    color: pulseBrand.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  checkboxRowActive: {
    borderColor: pulseBrand.accent,
    backgroundColor: pulseBrand.accentSoft,
  },
  checkboxLabel: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
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
    borderColor: pulseBrand.accent,
  },
  intentLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  intentLabelSelected: {
    color: pulseBrand.accent,
  },
  intentHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: pulseBrand.accent,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.text,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  addPhotoText: {
    color: pulseBrand.accent,
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 72,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: pulseBrand.accent,
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
  emailBlock: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emailInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
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
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emailHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
