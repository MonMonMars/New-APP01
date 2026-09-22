/** Set at web demo / CI build time via EXPO_PUBLIC_BUILD_ID (see scripts/resolve-build-id.sh). */
export const APP_BUILD_ID = process.env.EXPO_PUBLIC_BUILD_ID?.trim() || '';

export function getAppVersionLabel(appVersion: string): string {
  if (!APP_BUILD_ID) {
    return appVersion;
  }
  return `${appVersion} · ${APP_BUILD_ID}`;
}
