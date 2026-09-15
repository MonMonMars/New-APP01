export type NotificationPreferences = {
  matches: boolean;
  messages: boolean;
  likes: boolean;
  superLikes: boolean;
  boosts: boolean;
  marketing: boolean;
  disguiseSafe: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  matches: true,
  messages: true,
  likes: true,
  superLikes: true,
  boosts: true,
  marketing: false,
  disguiseSafe: true,
};

export type ThemeMode = 'dark' | 'light' | 'system';
