import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LegalPreviewSheet } from '../../components/legal/LegalPreviewSheet';
import { PhotoCarousel } from '../../components/PhotoCarousel';
import { getLegalUiStrings, LegalDocumentId } from '../../content/legal';
import { LocaleToggle } from '../../components/legal/LocaleToggle';
import { useApp } from '../../context/AppContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { useTranslation } from '../../i18n';
import { getGenderLabel, getOrientationLabel } from '../../i18n/labels';
import {
  Orientation,
  ProfileGender,
  RelationshipIntent,
} from '../../types/profile';
import { signInWithApple } from '../../utils/appleAuth';
import { pickProfilePhoto } from '../../utils/photoPicker';
import { colors, radii, spacing } from '../../theme';
import { pulseBrand } from '../../theme/pulseBrand';
import { SearchMapView } from '../../components/SearchMapView';
import { deriveShowMe } from '../../utils/deriveShowMe';
import { resolveUserLocation } from '../../services/userLocation';
import type { GeoPoint } from '../../utils/geoMap';
import { mapCenterForCity, zoomForRadius } from '../../utils/searchMapTiles';
import { AnimatedPressable } from '../../components/AnimatedPressable';

type Step = 'welcome' | 'rules' | 'location' | 'intent' | 'identity' | 'profile';

export function OnboardingFlow() {
  const insets = useSafeAreaInsets();
  const { t, locale } = useTranslation();
  const {
    completeOnboarding,
    signInWithAppleStub,
    signInWithEmailMagicLink,
    acceptOnboardingLegal,
    updatePreferences,
    preferences,
    user,
    isAuthenticated,
    userId,
    isSupabaseEnabled,
  } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [locationCenter, setLocationCenter] = useState<GeoPoint>(() =>
    mapCenterForCity(preferences.passportCity ?? 'New York, NY'),
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalPreviewId, setLegalPreviewId] = useState<LegalDocumentId | null>(null);
  const legalUi = getLegalUiStrings(locale);
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [intent, setIntent] = useState<RelationshipIntent>('not_sure');
  const [gender, setGender] = useState<ProfileGender>('man');
  const [orientation, setOrientation] = useState<Orientation>('straight');
  const [photos, setPhotos] = useState<string[]>(user.photos);
  const [authLoading, setAuthLoading] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [awaitingMagicLink, setAwaitingMagicLink] = useState(false);

  useEffect(() => {
    if (!isSupabaseEnabled || !awaitingMagicLink) {
      return;
    }
    if (isAuthenticated && userId && step === 'welcome') {
      setAwaitingMagicLink(false);
      setStep('rules');
    }
  }, [awaitingMagicLink, isAuthenticated, isSupabaseEnabled, step, userId]);

  const genderOptions: ProfileGender[] = ['woman', 'man', 'nonbinary'];
  const orientationOptions: Orientation[] = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'queer', 'asexual', 'other'];

  const rules = [
    t('onboarding.ruleHonest'),
    t('onboarding.ruleRespect'),
    t('onboarding.ruleSafe'),
    t('onboarding.ruleAge'),
  ];

  const intentOptions: { value: RelationshipIntent; label: string; hint: string }[] = [
    { value: 'long_term', label: t('onboarding.intentLongTerm'), hint: t('onboarding.intentLongTermHint') },
    { value: 'short_term', label: t('onboarding.intentShortTerm'), hint: t('onboarding.intentShortTermHint') },
    { value: 'new_friends', label: t('onboarding.intentFriends'), hint: t('onboarding.intentFriendsHint') },
    { value: 'not_sure', label: t('onboarding.intentNotSure'), hint: t('onboarding.intentNotSureHint') },
  ];

  const handleEmailSignIn = async () => {
    setAuthLoading(true);
    setEmailMessage(null);
    try {
      const result = await signInWithEmailMagicLink(email);
      setEmailMessage(result.message);
      if (result.ok) {
        if (isSupabaseEnabled) {
          setAwaitingMagicLink(true);
        } else {
          setStep('rules');
        }
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
    const uri = await pickProfilePhoto(locale);
    if (uri) {
      setPhotos((prev) => [...prev, uri]);
    }
  };

  const finish = () => {
    const parsedAge = Number.parseInt(age, 10);
    const nextAge = Number.isFinite(parsedAge) && parsedAge >= 18 && parsedAge <= 99
      ? parsedAge
      : user.age;

    updatePreferences({
      ...preferences,
      showMe: deriveShowMe(gender, orientation),
      passportCity: preferences.passportCity ?? 'New York, NY',
    });

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
          <Text style={styles.title}>{t('onboarding.welcomeTitle', { appName: DISGUISE_APP_NAME })}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.welcomeSubtitle')}
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
                <Text style={styles.appleButtonText}>{t('onboarding.continueApple')}</Text>
              </>
            )}
          </AnimatedPressable>
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
              onPress={handleEmailSignIn}
              disabled={authLoading || !email.trim()}
            >
              <Ionicons name="mail-outline" size={18} color={colors.text} />
              <Text style={styles.emailButtonText}>{t('onboarding.continueEmail')}</Text>
            </AnimatedPressable>
            {emailMessage ? <Text style={styles.emailHint}>{emailMessage}</Text> : null}
            {awaitingMagicLink ? (
              <Text style={styles.emailHint}>{t('onboarding.magicLinkWaiting')}</Text>
            ) : null}
          </View>
          <AnimatedPressable onPress={() => { signInWithAppleStub(); setStep('rules'); }}>
            <Text style={styles.link}>{t('onboarding.continueGuest')}</Text>
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
          <Text style={styles.title}>{t('onboarding.rulesTitle')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.rulesSubtitle')}</Text>
          {rules.map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
          <LocaleToggle compact />
          <Text style={styles.legalNote}>
            {legalUi.onboardingAgreePrefix}{' '}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('terms')}>
              {legalUi.termsLink}
            </Text>
            {legalUi.linkSeparator}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('privacy')}>
              {legalUi.privacyLink}
            </Text>
            {legalUi.linkSeparator}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('community')}>
              {legalUi.communityLink}
            </Text>
            {legalUi.linkSeparator}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('disguise')}>
              {legalUi.disguiseLink}
            </Text>
            {legalUi.cookieAnd}{' '}
            <Text style={styles.legalLink} onPress={() => setLegalPreviewId('safety')}>
              {legalUi.safetyLink}
            </Text>
            {legalUi.onboardingAgeNote}
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
            <Text style={styles.checkboxLabel}>{legalUi.onboardingCheckbox}</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={[styles.primaryButton, !legalAccepted && styles.primaryButtonDisabled]}
            onPress={() => {
              acceptOnboardingLegal();
              setStep('location');
            }}
            disabled={!legalAccepted}
          >
            <Text style={styles.primaryButtonText}>{legalUi.onboardingContinue}</Text>
          </AnimatedPressable>
        </ScrollView>
      )}

      {step === 'location' && (
        <View style={styles.step}>
          <Text style={styles.title}>{t('onboarding.locationTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.locationSubtitle')}
          </Text>
          <View style={styles.mapPreview}>
            <SearchMapView
              center={locationCenter}
              zoom={zoomForRadius(preferences.maxDistanceMiles)}
              radiusMiles={preferences.maxDistanceMiles}
              accentColor={pulseBrand.accent}
              pinColor={pulseBrand.accent}
              showRadiusRing={false}
              interactive={false}
              style={styles.mapPreviewInner}
            />
            <View style={styles.mapPreviewScrim} />
            <Text style={styles.mapPreviewLabel}>{t('onboarding.topStoriesNearYou')}</Text>
          </View>
          <AnimatedPressable
            style={styles.primaryButton}
            disabled={locationLoading}
            onPress={() => {
              setLocationLoading(true);
              void resolveUserLocation(preferences.passportCity)
                .then((result) => {
                  setLocationCenter(result.coords);
                  updatePreferences({
                    ...preferences,
                    travelMode: false,
                    passportCity:
                      result.source === 'device'
                        ? undefined
                        : preferences.passportCity ?? 'New York, NY',
                    mapSearchLat: result.source === 'device' ? result.coords.lat : undefined,
                    mapSearchLng: result.source === 'device' ? result.coords.lng : undefined,
                  });
                  setStep('intent');
                })
                .finally(() => {
                  setLocationLoading(false);
                });
            }}
          >
            {locationLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryButtonText}>{t('onboarding.useMyLocation')}</Text>
            )}
          </AnimatedPressable>
          {showLocationInfo ? (
            <Text style={styles.locationInfo}>
              {t('onboarding.locationHint')}
            </Text>
          ) : null}
          <AnimatedPressable onPress={() => setShowLocationInfo((v) => !v)}>
            <Text style={styles.link}>
              {showLocationInfo ? t('onboarding.hideDetails') : t('onboarding.tellMeMore')}
            </Text>
          </AnimatedPressable>
        </View>
      )}

      {step === 'intent' && (
        <View style={styles.step}>
          <Text style={styles.title}>{t('onboarding.intentTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.intentSubtitle')}
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
            <Text style={styles.primaryButtonText}>{t('common.continue')}</Text>
          </AnimatedPressable>
        </View>
      )}

      {step === 'identity' && (
        <View style={styles.step}>
          <Text style={styles.title}>{t('onboarding.identityTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.identitySubtitle')}
          </Text>

          <Text style={styles.label}>{t('onboarding.iAmA')}</Text>
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
                    {getGenderLabel(locale, option)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={styles.label}>{t('onboarding.myOrientation')}</Text>
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
                    {getOrientationLabel(locale, option)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <AnimatedPressable style={styles.primaryButton} onPress={() => setStep('profile')}>
            <Text style={styles.primaryButtonText}>{t('common.continue')}</Text>
          </AnimatedPressable>
        </View>
      )}

      {step === 'profile' && (
        <View style={styles.step}>
          <Text style={styles.title}>{t('onboarding.profileTitle')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.profileSubtitle')}</Text>

          <PhotoCarousel
            photos={photos}
            onAddPhoto={handleAddPhoto}
            editable
            height={200}
          />

          <AnimatedPressable style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Ionicons name="camera-outline" size={18} color={pulseBrand.accent} />
            <Text style={styles.addPhotoText}>{t('onboarding.addPhotos')}</Text>
          </AnimatedPressable>

          <Text style={styles.label}>{t('onboarding.nameLabel')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            placeholder={t('onboarding.namePlaceholder')}
          />
          <Text style={styles.label}>{t('onboarding.ageLabel')}</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            placeholder={t('onboarding.agePlaceholder')}
            keyboardType="number-pad"
          />
          <Text style={styles.label}>{t('onboarding.bioLabel')}</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.inputMultiline]}
            placeholderTextColor={colors.textMuted}
            placeholder={t('onboarding.bioPlaceholder')}
            multiline
          />
          <AnimatedPressable style={styles.primaryButton} onPress={finish}>
            <Text style={styles.primaryButtonText}>
              {t('onboarding.openApp', { appName: DISGUISE_APP_NAME })}
            </Text>
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
  mapPreview: {
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  mapPreviewInner: {
    ...StyleSheet.absoluteFill,
    minHeight: 200,
  },
  mapPreviewScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,15,16,0.28)',
  },
  mapPreviewLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    padding: spacing.md,
    zIndex: 1,
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
