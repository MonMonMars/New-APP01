import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { pulseBrand } from '../theme/pulseBrand';
import { resolveSparkSection } from '../types/preferences';
import type { ProfileGender } from '../types/profile';
import { usesFemalePulseExperience } from './genderAccountPerks';

export type DisguiseWorld = 'pulse';

export type DisguiseWorldMeta = {
  world: DisguiseWorld;
  name: string;
  tagline: string;
  unlockLabel: string;
  accent: string;
  accentBright: string;
  accentSoft: string;
  accentBorder: string;
  navy: string;
  homeTab: string;
  trendingTab: string;
  searchTitle: string;
  feedLabel: string;
};

/** Spark and Ember both use the same Pulse disguise shell. */
export function resolveDisguiseWorld(_section?: string | null): DisguiseWorld {
  return 'pulse';
}

function resolveUnlockLabel(section?: string | null, locale?: AppLocale | null): string {
  const lang = resolveAppLocale(locale);
  return resolveSparkSection(section) === 'ember'
    ? translate(lang, 'preferences.ember')
    : translate(lang, 'preferences.spark');
}

/** Convert a 6-digit hex color to an rgba() string. */
export function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return hex;
  }
  const n = Number.parseInt(raw, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function disguiseWorldMeta(
  section?: string | null,
  gender?: ProfileGender | null,
  locale?: AppLocale | null,
): DisguiseWorldMeta {
  const lang = resolveAppLocale(locale);
  const world = resolveDisguiseWorld(section);
  const unlockLabel = resolveUnlockLabel(section, locale);

  if (gender && usesFemalePulseExperience(gender)) {
    return {
      world,
      name: 'Pulse',
      tagline: translate(lang, 'disguiseWorld.pulseFemaleTagline'),
      unlockLabel,
      accent: pulseBrand.accent,
      accentBright: pulseBrand.accentBright,
      accentSoft: pulseBrand.accentSoft,
      accentBorder: pulseBrand.accentBorder,
      navy: pulseBrand.navy,
      homeTab: translate(lang, 'tabs.home'),
      trendingTab: translate(lang, 'tabs.cosmos'),
      searchTitle: translate(lang, 'disguiseWorld.searchPulse'),
      feedLabel: translate(lang, 'disguiseWorld.pulseFemaleFeedLabel'),
    };
  }

  return {
    world,
    name: 'Pulse',
    tagline: translate(lang, 'disguiseWorld.pulseTagline'),
    unlockLabel,
    accent: pulseBrand.accent,
    accentBright: pulseBrand.accentBright,
    accentSoft: pulseBrand.accentSoft,
    accentBorder: pulseBrand.accentBorder,
    navy: pulseBrand.navy,
    homeTab: translate(lang, 'tabs.home'),
    trendingTab: translate(lang, 'tabs.trending'),
    searchTitle: translate(lang, 'disguiseWorld.searchPulse'),
    feedLabel: translate(lang, 'disguiseWorld.pulseFeedLabel'),
  };
}
