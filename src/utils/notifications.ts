import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
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

type NotificationPrivacyOptions = {
  disguiseSafe?: boolean;
};

export async function scheduleMatchNotification(
  profileName: string,
  options?: NotificationPrivacyOptions,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const disguiseSafe = options?.disguiseSafe ?? false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: disguiseSafe ? 'Pulse — new activity' : "It's a Match! 🎉",
      body: disguiseSafe
        ? 'Someone interacted with your feed. Open Pulse to see more.'
        : `You and ${profileName} liked each other. Say hi!`,
    },
    trigger: null,
  });
}

export async function scheduleMessageNotification(
  profileName: string,
  preview: string,
  options?: NotificationPrivacyOptions,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const disguiseSafe = options?.disguiseSafe ?? false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: disguiseSafe ? 'Pulse — new reply' : profileName,
      body: disguiseSafe ? 'You have a new comment thread update.' : preview,
    },
    trigger: null,
  });
}
