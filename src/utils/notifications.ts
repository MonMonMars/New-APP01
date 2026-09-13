import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMatchNotification(profileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "It's a Match! 🎉",
      body: `You and ${profileName} liked each other. Say hi!`,
      sound: true,
    },
    trigger: null,
  });
}

export async function scheduleMessageNotification(
  profileName: string,
  preview: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: profileName,
      body: preview,
      sound: true,
    },
    trigger: null,
  });
}
