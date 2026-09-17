import { useApp } from '../context/AppContext';
import { useAppLocale } from './useAppLocale';
import { disguiseWorldMeta, DisguiseWorldMeta } from '../utils/disguiseWorld';

/** Gender-aware Pulse / Harbor branding for disguise surfaces. */
export function useDisguiseWorld(section?: string | null): DisguiseWorldMeta {
  const { user, preferences } = useApp();
  const { locale } = useAppLocale();
  return disguiseWorldMeta(section ?? preferences.sparkSection, user.gender, locale);
}
