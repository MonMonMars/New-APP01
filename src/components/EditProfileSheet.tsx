import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { RelationshipIntent, UserProfile, VoicePrompt } from '../types/profile';
import { OPENING_MOVE_SUGGESTIONS } from '../utils/openingMove';
import { pickProfilePhoto } from '../utils/photoPicker';
import { runVerificationFlow } from '../utils/verificationFlow';
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

const intentOptions: { value: RelationshipIntent; label: string }[] = [
  { value: 'long_term', label: 'Long-term partner' },
  { value: 'short_term', label: 'Something casual' },
  { value: 'new_friends', label: 'New friends' },
  { value: 'not_sure', label: 'Still figuring it out' },
];

export function EditProfileSheet({ visible, user, onClose, onSave }: EditProfileSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [photos, setPhotos] = useState<string[]>(user.photos);
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [intent, setIntent] = useState<RelationshipIntent | undefined>(user.intent);
  const [prompts, setPrompts] = useState(user.prompts ?? []);
  const [instagramConnected, setInstagramConnected] = useState(user.instagramConnected ?? false);
  const [spotifyConnected, setSpotifyConnected] = useState(user.spotifyConnected ?? false);
  const [ageVerified, setAgeVerified] = useState(user.ageVerified ?? false);
  const [photoVerified, setPhotoVerified] = useState(user.photoVerified ?? false);
  const [personVerified, setPersonVerified] = useState(user.personVerified ?? false);
  const [openingMove, setOpeningMove] = useState(user.openingMove ?? '');
  const [voicePrompt, setVoicePrompt] = useState<VoicePrompt | undefined>(user.voicePrompt);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user.name);
      setBio(user.bio);
      setAge(String(user.age));
      setPhotos(user.photos);
      setInterests(user.interests);
      setIntent(user.intent);
      setPrompts(user.prompts ?? []);
      setInstagramConnected(user.instagramConnected ?? false);
      setSpotifyConnected(user.spotifyConnected ?? false);
      setAgeVerified(user.ageVerified ?? false);
      setPhotoVerified(user.photoVerified ?? false);
      setPersonVerified(user.personVerified ?? false);
      setOpeningMove(user.openingMove ?? '');
      setVoicePrompt(user.voicePrompt);
    }
  }, [visible, user]);

  const handleAddPhoto = async () => {
    const uri = await pickProfilePhoto();
    if (uri) {
      setPhotos((prev) => [...prev, uri]);
    }
  };

  const handleVerifyPhoto = () => {
    runVerificationFlow('photo', () => setPhotoVerified(true));
  };

  const handleVerifyPerson = () => {
    runVerificationFlow('person', () => setPersonVerified(true));
  };

  const handleVerifyAge = () => {
    runVerificationFlow('age', () => setAgeVerified(true));
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
      prompts,
      instagramConnected,
      spotifyConnected,
      ageVerified,
      photoVerified,
      personVerified,
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
            <Text style={[styles.cancel, { color: colors.textMuted }]}>Cancel</Text>
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>Edit profile</Text>
          <AnimatedPressable onPress={handleSave}>
            <Text style={[styles.save, { color: colors.gradientEnd }]}>Save</Text>
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
            <Text style={[styles.addPhotoText, { color: colors.gradientEnd }]}>Add photo from library</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={photoVerified ? undefined : handleVerifyPhoto}
            disabled={photoVerified}
          >
            <Ionicons name="camera" size={20} color={photoVerified ? colors.like : colors.textMuted} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {photoVerified ? 'Photo verified' : 'Verify your photos'}
            </Text>
            {photoVerified && <Ionicons name="checkmark-circle" size={18} color={colors.like} />}
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={personVerified ? undefined : handleVerifyPerson}
            disabled={personVerified}
          >
            <Ionicons name="person" size={20} color={personVerified ? colors.like : colors.textMuted} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {personVerified ? 'Real person verified' : 'Verify you are a real person'}
            </Text>
            {personVerified && <Ionicons name="checkmark-circle" size={18} color={colors.like} />}
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={ageVerified ? undefined : handleVerifyAge}
            disabled={ageVerified}
          >
            <Ionicons name="shield-checkmark" size={20} color={ageVerified ? colors.like : colors.textMuted} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {ageVerified ? 'Age verified (18+)' : 'Verify your age'}
            </Text>
            {ageVerified && <Ionicons name="checkmark-circle" size={18} color={colors.like} />}
          </AnimatedPressable>

          <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Your first name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            keyboardType="number-pad"
            placeholder="18+"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.inputMultiline, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Tell people what you're about"
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Looking for</Text>
          <View style={styles.intentRow}>
            {intentOptions.map((option) => {
              const selected = intent === option.value;
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
                  onPress={() => setIntent(option.value)}
                >
                  <Text style={[styles.intentChipText, { color: selected ? '#fff' : colors.text }]}>
                    {option.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <InterestsEditor interests={interests} onChange={setInterests} />

          <PromptsEditor prompts={prompts} onChange={setPrompts} />

          <Text style={[styles.label, { color: colors.textMuted }]}>Opening Move</Text>
          <Text style={[styles.openingMoveHint, { color: colors.textMuted }]}>
            Pick a conversation starter matches see when you connect — like Bumble&apos;s Opening Move.
          </Text>
          <TextInput
            value={openingMove}
            onChangeText={setOpeningMove}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Ask something fun to break the ice..."
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
                    {suggestion}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Voice prompt</Text>
          <AnimatedPressable
            style={[styles.verifyRow, { backgroundColor: colors.surface }]}
            onPress={() => setShowVoicePrompt(true)}
          >
            <Ionicons name="mic" size={20} color={colors.gradientEnd} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {voicePrompt ? 'Edit voice prompt' : 'Add a voice prompt'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </AnimatedPressable>

          <SocialConnectRows
            instagramConnected={instagramConnected}
            spotifyConnected={spotifyConnected}
            onToggleInstagram={() => setInstagramConnected((v) => !v)}
            onToggleSpotify={() => setSpotifyConnected((v) => !v)}
          />
        </ScrollView>
      </View>

      <VoicePromptSheet
        visible={showVoicePrompt}
        existing={voicePrompt}
        onClose={() => setShowVoicePrompt(false)}
        onSave={(prompt) => setVoicePrompt(prompt)}
        onRemove={() => setVoicePrompt(undefined)}
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
