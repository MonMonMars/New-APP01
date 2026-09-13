import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

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
