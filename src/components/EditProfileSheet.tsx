import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoCarousel } from './PhotoCarousel';
import { UserProfile } from '../types/profile';
import { pickProfilePhoto } from '../utils/photoPicker';
import { colors, radii, spacing } from '../theme';

type EditProfileSheetProps = {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
};

export function EditProfileSheet({ visible, user, onClose, onSave }: EditProfileSheetProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [photos, setPhotos] = useState<string[]>(user.photos);

  useEffect(() => {
    if (visible) {
      setName(user.name);
      setBio(user.bio);
      setAge(String(user.age));
      setPhotos(user.photos);
    }
  }, [visible, user]);

  const handleAddPhoto = async () => {
    const uri = await pickProfilePhoto();
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
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Edit profile</Text>
          <Pressable onPress={handleSave}>
            <Text style={styles.save}>Save</Text>
          </Pressable>
        </View>

        <PhotoCarousel
          photos={photos}
          onAddPhoto={handleAddPhoto}
          editable
          height={240}
        />

        <Pressable style={styles.addPhotoRow} onPress={handleAddPhoto}>
          <Ionicons name="images-outline" size={20} color={colors.gradientEnd} />
          <Text style={styles.addPhotoText}>Add photo from library</Text>
        </Pressable>

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Your first name"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          value={age}
          onChangeText={setAge}
          style={styles.input}
          keyboardType="number-pad"
          placeholder="18+"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[styles.input, styles.inputMultiline]}
          placeholder="Tell people what you're about"
          placeholderTextColor={colors.textMuted}
          multiline
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cancel: {
    color: colors.textMuted,
    fontSize: 16,
  },
  save: {
    color: colors.gradientEnd,
    fontSize: 16,
    fontWeight: '700',
  },
  addPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  addPhotoText: {
    color: colors.gradientEnd,
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
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
});
