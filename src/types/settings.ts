export type NotificationPreferences = {
  matches: boolean;
  messages: boolean;
  likes: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  matches: true,
  messages: true,
  likes: true,
};

export type ThemeMode = 'dark' | 'light' | 'system';
