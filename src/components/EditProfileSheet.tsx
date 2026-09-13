import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserProfile } from '../types/profile';
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

  useEffect(() => {
    if (visible) {
      setName(user.name);
      setBio(user.bio);
      setAge(String(user.age));
    }
  }, [visible, user]);

  const handleAddPhoto = () => {
    Alert.alert(
      'Add a photo',
      'Photo upload is coming soon. For now, your profile uses the default Spark photo.',
      [{ text: 'Got it' }],
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

        <Pressable style={styles.photoRow} onPress={handleAddPhoto}>
          <Image source={{ uri: user.photos[0] }} style={styles.photo} />
          <View style={styles.photoText}>
            <Text style={styles.photoTitle}>Profile photo</Text>
            <Text style={styles.photoHint}>Tap to add from camera roll</Text>
          </View>
          <View style={styles.addBadge}>
            <Ionicons name="camera" size={18} color={colors.text} />
          </View>
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
    marginBottom: spacing.xl,
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
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  photoText: {
    flex: 1,
  },
  photoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  photoHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  addBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gradientEnd,
    alignItems: 'center',
    justifyContent: 'center',
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
