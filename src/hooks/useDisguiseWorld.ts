import { useApp } from '../context/AppContext';
import { useAppLocale } from './useAppLocale';
import { disguiseWorldMeta, DisguiseWorldMeta } from '../utils/disguiseWorld';

/** Gender-aware Pulse branding for disguise surfaces (section-aware content pool). */
export function useDisguiseWorld(section?: string | null): DisguiseWorldMeta {
  const { user, pulseContextSection } = useApp();
  const { locale } = useAppLocale();
  return disguiseWorldMeta(section ?? pulseContextSection, user.gender, locale);
}
