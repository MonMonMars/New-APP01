import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';

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
  locale?: AppLocale | null;
};

function resolveLocale(locale?: AppLocale | null): AppLocale {
  return resolveAppLocale(locale);
}

export async function scheduleMatchNotification(
  profileName: string,
  options?: NotificationPrivacyOptions,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const locale = resolveLocale(options?.locale);
  const disguiseSafe = options?.disguiseSafe ?? false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: disguiseSafe
        ? translate(locale, 'notifications.matchTitleDisguise')
        : translate(locale, 'notifications.matchTitle'),
      body: disguiseSafe
        ? translate(locale, 'notifications.matchBodyDisguise')
        : translate(locale, 'notifications.matchBody', { name: profileName }),
    },
    trigger: null,
  });
}

export async function scheduleDateCheckInReminder(
  profileName: string,
  location: string,
  minutesFromNow = 60,
  locale?: AppLocale | null,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const resolvedLocale = resolveLocale(locale);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: translate(resolvedLocale, 'notifications.dateCheckInTitle'),
      body: translate(resolvedLocale, 'notifications.dateCheckInBody', {
        location,
        name: profileName,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(60, minutesFromNow * 60),
    },
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

  const locale = resolveLocale(options?.locale);
  const disguiseSafe = options?.disguiseSafe ?? false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: disguiseSafe
        ? translate(locale, 'notifications.messageTitleDisguise')
        : profileName,
      body: disguiseSafe
        ? translate(locale, 'notifications.messageBodyDisguise')
        : preview,
    },
    trigger: null,
  });
}
