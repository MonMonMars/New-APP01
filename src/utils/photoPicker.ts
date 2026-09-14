import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

import { uploadProfilePhotoToCloud } from '../services/cloudStorage';

export async function pickProfilePhoto(): Promise<string | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo library access to add profile pictures.',
      );
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/** Pick a photo and upload to cloud storage when userId + Supabase are available. */
export async function pickAndUploadProfilePhoto(userId?: string): Promise<string | null> {
  const localUri = await pickProfilePhoto();
  if (!localUri) {
    return null;
  }
  if (!userId) {
    return localUri;
  }
  return uploadProfilePhotoToCloud(userId, localUri);
}
