import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useAppLocale } from '../hooks/useAppLocale';
import {
  getGenderLabel,
  getOpeningMoveSuggestionLabel,
  getOrientationLabel,
  getProfileIntentLabel,
  getShowMeLabel,
} from '../i18n/labels';
import { useTranslation } from '../i18n';
import {
  EmberAvailability,
  EmberDiscretion,
  EmberSeeking,
  EMBER_PROMPT_OPTIONS,
  HINGE_PROMPT_OPTIONS,
  Orientation,
  ProfileGender,
  RelationshipIntent,
  RelationshipStatus,
  UserProfile,
  VoicePrompt,
} from '../types/profile';
import { OPENING_MOVE_SUGGESTIONS } from '../utils/openingMove';
import { pickProfilePhoto } from '../utils/photoPicker';
import { resolveSparkSection, ShowMePreference } from '../types/preferences';
import { ProfileCoachSheet } from './ProfileCoachSheet';
import { VerificationSheet } from './VerificationSheet';
import { VoicePromptSheet } from './VoicePromptSheet';
import { InterestsEditor } from './InterestsEditor';
import { PhotoCarousel } from './PhotoCarousel';
import { PromptsEditor } from './PromptsEditor';
import { SocialConnectRows } from './SocialConnectRows';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type EditProfileSheetProps = {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
};

const discretionOptions: EmberDiscretion[] = ['open', 'careful', 'hidden'];
const seekingOptions: EmberSeeking[] = ['online', 'travel', 'ongoing', 'light'];
const availabilityOptions: EmberAvailability[] = ['evenings', 'weekends', 'flexible'];
const genderOptions: ProfileGender[] = ['woman', 'man', 'nonbinary'];
const showMeOptions: ShowMePreference[] = ['women', 'men', 'everyone'];

const orientationOptions: Orientation[] = [
  'straight',
  'gay',
  'lesbian',
  'bisexual',
  'pansexual',
  'queer',
  'asexual',
  'other',
];

export function EditProfileSheet({ visible, user, onClose, onSave }: EditProfileSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences, updatePreferences } = useApp();
  const { locale } = useAppLocale();
  const { t } = useTranslation();
  const isEmber = resolveSparkSection(preferences.sparkSection) === 'ember';

  const intentOptions: RelationshipIntent[] = ['long_term', 'short_term', 'new_friends', 'not_sure'];
  const statusOptions: { value: RelationshipStatus; label: string }[] = [
    { value: 'single', label: t('editProfile.statusSingle') },
    { value: 'married', label: t('editProfile.statusMarried') },
    { value: 'divorced', label: t('editProfile.statusDivorced') },
  ];
  const emberDiscretionLabels: Record<EmberDiscretion, string> = {
    open: t('editProfile.emberDiscretionOpen'),
    careful: t('editProfile.emberDiscretionCareful'),
    hidden: t('editProfile.emberDiscretionHidden'),
  };
  const emberDiscretionHints: Record<EmberDiscretion, string> = {
    open: t('editProfile.emberDiscretionOpenHint'),
    careful: t('editProfile.emberDiscretionCarefulHint'),
    hidden: t('editProfile.emberDiscretionHiddenHint'),
  };
  const emberSeekingLabels: Record<EmberSeeking, string> = {
    online: t('editProfile.emberSeekingOnline'),
    travel: t('editProfile.emberSeekingTravel'),
    ongoing: t('editProfile.emberSeekingOngoing'),
    light: t('editProfile.emberSeekingLight'),
  };
  const emberAvailabilityLabels: Record<EmberAvailability, string> = {
    evenings: t('editProfile.emberAvailEvenings'),
    weekends: t('editProfile.emberAvailWeekends'),
    flexible: t('editProfile.emberAvailFlexible'),
  };
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [photos, setPhotos] = useState<string[]>(user.photos);
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [intent, setIntent] = useState<RelationshipIntent | undefined>(user.intent);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>(
    user.relationshipStatus ?? 'single',
  );
  const [emberDiscretion, setEmberDiscretion] = useState<EmberDiscretion>(user.emberDiscretion ?? 'careful');
  const [emberSeeking, setEmberSeeking] = useState<EmberSeeking>(user.emberSeeking ?? 'ongoing');
  const [emberAvailability, setEmberAvailability] = useState<EmberAvailability>(
    user.emberAvailability ?? 'flexible',
  );
  const [prompts, setPrompts] = useState(user.prompts ?? []);
  const [instagramConnected, setInstagramConnected] = useState(user.instagramConnected ?? false);
  const [instagramHandle, setInstagramHandle] = useState(user.instagramHandle ?? '');
  const [spotifyConnected, setSpotifyConnected] = useState(user.spotifyConnected ?? false);
  const [spotifyHandle, setSpotifyHandle] = useState(user.spotifyHandle ?? '');
  const [ageVerified, setAgeVerified] = useState(user.ageVerified ?? false);
  const [photoVerified, setPhotoVerified] = useState(user.photoVerified ?? false);
  const [personVerified, setPersonVerified] = useState(user.personVerified ?? false);
  const [gender, setGender] = useState<ProfileGender>(user.gender ?? 'man');
  const [orientation, setOrientation] = useState<Orientation>(user.orientation ?? 'straight');
  const [openingMove, setOpeningMove] = useState(user.openingMove ?? '');
  const [voicePrompt, setVoicePrompt] = useState<VoicePrompt | undefined>(user.voicePrompt);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [showProfileCoach, setShowProfileCoach] = useState(false);
  const [activeVerification, setActiveVerification] = useState<'photo' | 'person' | 'age' | null>(null);

  useEffect(() => {
    if (visible) {
      setName(user.name);
      setBio(user.bio);
      setAge(String(user.age));
      setPhotos(user.photos);
      setInterests(user.interests);
      setIntent(user.intent);
      setRelationshipStatus(user.relationshipStatus ?? 'single');
      setEmberDiscretion(user.emberDiscretion ?? 'careful');
      setEmberSeeking(user.emberSeeking ?? 'ongoing');
      setEmberAvailability(user.emberAvailability ?? 'flexible');
      setPrompts(user.prompts ?? []);
      setInstagramConnected(user.instagramConnected ?? false);
      setInstagramHandle(user.instagramHandle ?? '');
      setSpotifyConnected(user.spotifyConnected ?? false);
      setSpotifyHandle(user.spotifyHandle ?? '');
      setAgeVerified(user.ageVerified ?? false);
      setPhotoVerified(user.photoVerified ?? false);
      setPersonVerified(user.personVerified ?? false);
      setGender(user.gender ?? 'man');
      setOrientation(user.orientation ?? 'straight');
      setOpeningMove(user.openingMove ?? '');
      setVoicePrompt(user.voicePrompt);
    }
  }, [visible, user]);

  const handleAddPhoto = async () => {
    const uri = await pickProfilePhoto(locale);
    if (uri) {
      setPhotos((prev) => [...prev, uri]);
    }
  };

  const handleSave = () => {
    const parsedAge = Number.parseInt(age, 10);
    const nextAge = Number.isFinite(parsedAge) && parsedAge >= 18 && parsedAge <= 99
      ? parsedAge
      : user.age;

    onSave({
      ...user,
      name: name.trim() || user.name,
      bio: bio.trim() || user.bio,
      age: nextAge,
      photos: photos.length > 0 ? photos : user.photos,
      interests,
      intent,
      relationshipStatus,
      emberDiscretion,
      emberSeeking,
      emberAvailability,
      prompts,
      instagramConnected,
      instagramHandle: instagramConnected ? instagramHandle.trim() || undefined : undefined,
      spotifyConnected,
      spotifyHandle: spotifyConnected ? spotifyHandle.trim() || undefined : undefined,
      ageVerified,
      photoVerified,
      personVerified,
      gender,
      orientation,
      openingMove: openingMove.trim() || undefined,
      voicePrompt,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={onClose}>
            <Text style={[styles.cancel, { color: colors.textMuted }]}>{t('common.cancel')}</Text>
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{t('profile.editProfile')}</Text>
          <AnimatedPressable onPress={handleSave}>
            <Text style={[styles.save, { color: colors.gradientEnd }]}>{t('common.save')}</Text>
          </AnimatedPressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <PhotoCarousel
            photos={photos}
            onAddPhoto={handleAddPhoto}
            editable
            height={240}
          />

          <AnimatedPressable style={styles.addPhotoRow} onPress={handleAddPhoto}>
            <Ionicons name="images-outline" size={20} color={colors.gradientEnd} />
            <Text style={[styles.addPhotoText, { color: colors.gradientEnd }]}>
              {t('editProfile.addPhotoFromLibrary')}
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={photoVerified ? undefined : () => setActiveVerification('photo')}
            disabled={photoVerified}
          >
            <Ionicons name="camera" size={20} color={photoVerified ? colors.like : colors.textMuted} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {photoVerified ? t('editProfile.photoVerified') : t('editProfile.verifyPhotos')}
            </Text>
            {photoVerified && <Ionicons name="checkmark-circle" size={18} color={colors.like} />}
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={personVerified ? undefined : () => setActiveVerification('person')}
            disabled={personVerified}
          >
            <Ionicons name="person" size={20} color={personVerified ? colors.like : colors.textMuted} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {personVerified ? t('editProfile.personVerified') : t('editProfile.verifyPerson')}
            </Text>
            {personVerified && <Ionicons name="checkmark-circle" size={18} color={colors.like} />}
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={ageVerified ? undefined : () => setActiveVerification('age')}
            disabled={ageVerified}
          >
            <Ionicons name="shield-checkmark" size={20} color={ageVerified ? colors.like : colors.textMuted} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {ageVerified ? t('editProfile.ageVerified') : t('editProfile.verifyAge')}
            </Text>
            {ageVerified && <Ionicons name="checkmark-circle" size={18} color={colors.like} />}
          </AnimatedPressable>

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('onboarding.nameLabel')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder={t('onboarding.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('onboarding.ageLabel')}</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            keyboardType="number-pad"
            placeholder={t('onboarding.agePlaceholder')}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('editProfile.iAmA')}</Text>
          <Text style={[styles.openingMoveHint, { color: colors.textMuted }]}>
            {t('editProfile.genderHint')}
          </Text>
          <View style={styles.intentRow}>
            {genderOptions.map((option) => {
              const selected = gender === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.surface,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#fff' : colors.text }]}>
                    {getGenderLabel(locale, option)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('editProfile.myOrientation')}</Text>
          <View style={styles.intentRow}>
            {orientationOptions.map((option) => {
              const selected = orientation === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.surface,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => setOrientation(option)}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#fff' : colors.text }]}>
                    {getOrientationLabel(locale, option)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{t('onboarding.bioLabel')}</Text>
            <AnimatedPressable onPress={() => setShowProfileCoach(true)}>
              <Text style={[styles.coachLink, { color: colors.gradientEnd }]}>{t('editProfile.aiCoach')}</Text>
            </AnimatedPressable>
          </View>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.inputMultiline, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder={t('editProfile.bioPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('editProfile.statusLabel')}</Text>
          <Text style={[styles.openingMoveHint, { color: colors.textMuted }]}>
            {t('editProfile.statusHint')}
          </Text>
          <View style={styles.intentRow}>
            {statusOptions.map((option) => {
              const selected = relationshipStatus === option.value;
              return (
                <AnimatedPressable
                  key={option.value}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.surface,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => setRelationshipStatus(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#fff' : colors.text }]}>
                    {option.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.ember }]}>{t('editProfile.emberDiscretion')}</Text>
          <Text style={[styles.openingMoveHint, { color: colors.textMuted }]}>
            {t('editProfile.emberDiscretionHint')}
          </Text>
          <View style={styles.intentRow}>
            {discretionOptions.map((value) => {
              const selected = emberDiscretion === value;
              return (
                <AnimatedPressable
                  key={value}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.ember : colors.surface,
                      borderColor: selected ? colors.ember : colors.border,
                    },
                  ]}
                  onPress={() => setEmberDiscretion(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={emberDiscretionLabels[value]}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#111' : colors.text }]}>
                    {emberDiscretionLabels[value]}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
          <Text style={[styles.openingMoveHint, { color: colors.textMuted }]}>
            {emberDiscretionHints[emberDiscretion]}
          </Text>

          <Text style={[styles.label, { color: colors.ember }]}>{t('editProfile.emberLookingFor')}</Text>
          <View style={styles.intentRow}>
            {seekingOptions.map((value) => {
              const selected = emberSeeking === value;
              return (
                <AnimatedPressable
                  key={value}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.ember : colors.surface,
                      borderColor: selected ? colors.ember : colors.border,
                    },
                  ]}
                  onPress={() => setEmberSeeking(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={emberSeekingLabels[value]}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#111' : colors.text }]}>
                    {emberSeekingLabels[value]}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.ember }]}>{t('editProfile.emberAvailability')}</Text>
          <View style={styles.intentRow}>
            {availabilityOptions.map((value) => {
              const selected = emberAvailability === value;
              return (
                <AnimatedPressable
                  key={value}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.ember : colors.surface,
                      borderColor: selected ? colors.ember : colors.border,
                    },
                  ]}
                  onPress={() => setEmberAvailability(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={emberAvailabilityLabels[value]}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#111' : colors.text }]}>
                    {emberAvailabilityLabels[value]}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          {!isEmber ? (
            <>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('preferences.discoveryShowMe')}</Text>
          <View style={styles.intentRow}>
            {showMeOptions.map((option) => {
              const selected = preferences.showMe === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.surface,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => updatePreferences({ ...preferences, showMe: option })}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#fff' : colors.text }]}>
                    {getShowMeLabel(locale, option)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('editProfile.lookingFor')}</Text>
          <View style={styles.intentRow}>
            {intentOptions.map((option) => {
              const selected = intent === option;
              return (
                <AnimatedPressable
                  key={option}
                  style={[
                    styles.intentChip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.surface,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => setIntent(option)}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#fff' : colors.text }]}>
                    {getProfileIntentLabel(locale, option)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
            </>
          ) : null}

          <InterestsEditor interests={interests} onChange={setInterests} />

          <PromptsEditor
            prompts={prompts}
            onChange={setPrompts}
            questionOptions={isEmber ? [...EMBER_PROMPT_OPTIONS, ...HINGE_PROMPT_OPTIONS] : [...HINGE_PROMPT_OPTIONS, ...EMBER_PROMPT_OPTIONS]}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('editProfile.openingMoveLabel')}</Text>
          <Text style={[styles.openingMoveHint, { color: colors.textMuted }]}>
            {t('editProfile.openingMoveHint')}
          </Text>
          <TextInput
            value={openingMove}
            onChangeText={setOpeningMove}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder={t('editProfile.openingMovePlaceholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={120}
          />
          <View style={styles.openingMoveRow}>
            {OPENING_MOVE_SUGGESTIONS.slice(0, 4).map((suggestion) => {
              const selected = openingMove === suggestion;
              return (
                <AnimatedPressable
                  key={suggestion}
                  style={[
                    styles.openingMoveChip,
                    {
                      backgroundColor: selected ? colors.gradientEnd : colors.surface,
                      borderColor: selected ? colors.gradientEnd : colors.border,
                    },
                  ]}
                  onPress={() => setOpeningMove(suggestion)}
                >
                  <Text style={[styles.openingMoveChipText, { color: selected ? '#fff' : colors.text }]}>
                    {getOpeningMoveSuggestionLabel(locale, suggestion)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>{t('editProfile.voicePromptLabel')}</Text>
          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={() => setShowVoicePrompt(true)}
          >
            <Ionicons name="mic" size={20} color={colors.gradientEnd} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {voicePrompt ? t('editProfile.editVoicePrompt') : t('editProfile.addVoicePrompt')}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </AnimatedPressable>

          <SocialConnectRows
            instagramConnected={instagramConnected}
            instagramHandle={instagramHandle}
            spotifyConnected={spotifyConnected}
            spotifyHandle={spotifyHandle}
            onConnectInstagram={(handle) => {
              setInstagramConnected(true);
              setInstagramHandle(handle);
            }}
            onDisconnectInstagram={() => {
              setInstagramConnected(false);
              setInstagramHandle('');
            }}
            onConnectSpotify={(handle) => {
              setSpotifyConnected(true);
              setSpotifyHandle(handle);
            }}
            onDisconnectSpotify={() => {
              setSpotifyConnected(false);
              setSpotifyHandle('');
            }}
          />
        </ScrollView>
      </View>

      <ProfileCoachSheet
        visible={showProfileCoach}
        user={{
          ...user,
          name,
          bio,
          age: Number.parseInt(age, 10) || user.age,
          interests,
          openingMove,
          intent,
          relationshipStatus,
        }}
        onClose={() => setShowProfileCoach(false)}
        onApplyBio={setBio}
        onApplyOpeningMove={setOpeningMove}
      />

      <VoicePromptSheet
        visible={showVoicePrompt}
        existing={voicePrompt}
        onClose={() => setShowVoicePrompt(false)}
        onSave={(prompt) => setVoicePrompt(prompt)}
        onRemove={() => setVoicePrompt(undefined)}
      />

      <VerificationSheet
        visible={activeVerification !== null}
        kind={activeVerification ?? 'photo'}
        photoUri={photos[0]}
        onClose={() => setActiveVerification(null)}
        onComplete={() => {
          if (activeVerification === 'photo') {
            setPhotoVerified(true);
          } else if (activeVerification === 'person') {
            setPersonVerified(true);
          } else if (activeVerification === 'age') {
            setAgeVerified(true);
          }
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  cancel: {
    fontSize: 16,
  },
  save: {
    fontSize: 16,
    fontWeight: '700',
  },
  addPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  verifyText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  coachLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radii.card,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  intentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  intentChip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  intentChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openingMoveHint: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  openingMoveRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  openingMoveChip: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  openingMoveChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
