import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { UserProfile } from '../types/profile';
import { pickProfilePhoto } from '../utils/photoPicker';
import { PhotoCarousel } from './PhotoCarousel';
import { PromptsEditor } from './PromptsEditor';
import { SocialConnectRows } from './SocialConnectRows';
import { radii, spacing } from '../theme';

type EditProfileSheetProps = {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
};

export function EditProfileSheet({ visible, user, onClose, onSave }: EditProfileSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [photos, setPhotos] = useState<string[]>(user.photos);
  const [prompts, setPrompts] = useState(user.prompts ?? []);
  const [instagramConnected, setInstagramConnected] = useState(user.instagramConnected ?? false);
  const [spotifyConnected, setSpotifyConnected] = useState(user.spotifyConnected ?? false);
  const [ageVerified, setAgeVerified] = useState(user.ageVerified ?? false);

  useEffect(() => {
    if (visible) {
      setName(user.name);
      setBio(user.bio);
      setAge(String(user.age));
      setPhotos(user.photos);
      setPrompts(user.prompts ?? []);
      setInstagramConnected(user.instagramConnected ?? false);
      setSpotifyConnected(user.spotifyConnected ?? false);
      setAgeVerified(user.ageVerified ?? false);
    }
  }, [visible, user]);

  const handleAddPhoto = async () => {
    const uri = await pickProfilePhoto();
    if (uri) {
      setPhotos((prev) => [...prev, uri]);
    }
  };

  const handleVerifyAge = () => {
    Alert.alert(
      'Age verification',
      'In production, this would use ID verification (e.g. Yoti, Onfido). For the demo, we will mark your profile as 18+ verified.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify (demo)', onPress: () => setAgeVerified(true) },
      ],
    );
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
      prompts,
      instagramConnected,
      spotifyConnected,
      ageVerified,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={[styles.cancel, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Edit profile</Text>
          <Pressable onPress={handleSave}>
            <Text style={[styles.save, { color: colors.gradientEnd }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <PhotoCarousel
            photos={photos}
            onAddPhoto={handleAddPhoto}
            editable
            height={240}
          />

          <Pressable style={styles.addPhotoRow} onPress={handleAddPhoto}>
            <Ionicons name="images-outline" size={20} color={colors.gradientEnd} />
            <Text style={[styles.addPhotoText, { color: colors.gradientEnd }]}>Add photo from library</Text>
          </Pressable>

          <Pressable style={[styles.verifyRow, { backgroundColor: colors.surface }]} onPress={handleVerifyAge}>
            <Ionicons name="shield-checkmark" size={20} color={ageVerified ? colors.like : colors.textMuted} />
            <Text style={[styles.verifyText, { color: colors.text }]}>
              {ageVerified ? 'Age verified (18+)' : 'Verify your age'}
            </Text>
            {ageVerified && <Ionicons name="checkmark-circle" size={18} color={colors.like} />}
          </Pressable>

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

          <PromptsEditor prompts={prompts} onChange={setPrompts} />

          <SocialConnectRows
            instagramConnected={instagramConnected}
            spotifyConnected={spotifyConnected}
            onToggleInstagram={() => setInstagramConnected((v) => !v)}
            onToggleSpotify={() => setSpotifyConnected((v) => !v)}
          />
        </ScrollView>
      </View>
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
});
