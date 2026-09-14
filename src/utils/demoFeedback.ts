import { Alert, Platform } from 'react-native';

/** Lightweight in-demo feedback when a control is not fully wired to backend. */
export function showDemoToast(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
