import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getSupabaseClient, isSupabaseConfigured } from './supabase';

/** Register device with Expo Push Service (cloud) and persist token in Supabase. */
export async function registerCloudPushToken(userId: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const token = tokenResponse.data;

  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,expo_push_token' },
    );
  }

  return token;
}

/** Send a push via Expo Push API (cloud). Used for demo bot replies. */
export async function sendExpoPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
): Promise<void> {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        sound: 'default',
      }),
    });
  } catch {
    // Push delivery is best-effort
  }
}
