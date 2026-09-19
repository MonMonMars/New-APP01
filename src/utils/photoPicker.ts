import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

import { translate } from '../i18n';
import { uploadProfilePhotoToCloud } from '../services/cloudStorage';
import { AppLocale, resolveAppLocale } from '../types/locale';

export async function pickProfilePhoto(locale?: AppLocale | null): Promise<string | null> {
  const resolvedLocale = resolveAppLocale(locale);
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        translate(resolvedLocale, 'utils.photoPermissionTitle'),
        translate(resolvedLocale, 'utils.photoPermissionBody'),
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
export async function pickAndUploadProfilePhoto(
  userId?: string,
  locale?: AppLocale | null,
): Promise<string | null> {
  const localUri = await pickProfilePhoto(locale);
  if (!localUri) {
    return null;
  }
  if (!userId) {
    return localUri;
  }
  return uploadProfilePhotoToCloud(userId, localUri);
}
