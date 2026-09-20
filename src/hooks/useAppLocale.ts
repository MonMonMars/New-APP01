import { useApp } from '../context/AppContext';
import { AppLocale, resolveAppLocale } from '../types/locale';

export function useAppLocale() {
  const { preferences, updatePreferences, accountRegion } = useApp();
  const locale = resolveAppLocale(preferences.appLocale, accountRegion.countryCode);

  const setLocale = (next: AppLocale) => {
    updatePreferences({ ...preferences, appLocale: next });
  };

  return { locale, setLocale, isZh: locale === 'zh-TW' };
}
