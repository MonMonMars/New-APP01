export type SecuritySettings = {
  /** Require biometric or PIN before leaving Pulse / opening Spark. */
  appLockEnabled: boolean;
  /** Use Face ID / Touch ID / device biometrics when available. */
  biometricEnabled: boolean;
  /** Fallback numeric PIN (stored as hash only). */
  pinEnabled: boolean;
  /** Switch to Pulse when app goes to background. */
  autoDisguiseOnBackground: boolean;
  /** Neutral notification copy while in disguise mode. */
  disguiseSafeNotifications: boolean;
  /** Re-lock Spark after N minutes in background (0 = off). */
  sessionTimeoutMinutes: number;
  /** Block screenshots and screen recording on Spark screens (native). */
  blockScreenshots: boolean;
  /** Hide Spark UI in app switcher with Pulse overlay. */
  privacyShieldEnabled: boolean;
};

export const defaultSecuritySettings: SecuritySettings = {
  appLockEnabled: true,
  biometricEnabled: true,
  pinEnabled: false,
  autoDisguiseOnBackground: true,
  disguiseSafeNotifications: true,
  sessionTimeoutMinutes: 5,
  blockScreenshots: true,
  privacyShieldEnabled: true,
};
