import { useApp } from '../context/AppContext';
import { disguiseWorldMeta, DisguiseWorldMeta } from '../utils/disguiseWorld';

/** Gender-aware Pulse / Harbor branding for disguise surfaces. */
export function useDisguiseWorld(section?: string | null): DisguiseWorldMeta {
  const { user, preferences } = useApp();
  return disguiseWorldMeta(section ?? preferences.sparkSection, user.gender);
}
