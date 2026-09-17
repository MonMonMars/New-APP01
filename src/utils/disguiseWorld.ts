import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { harborBrand } from '../theme/harborBrand';
import { pulseBrand } from '../theme/pulseBrand';
import { resolveSparkSection } from '../types/preferences';
import type { ProfileGender } from '../types/profile';
import { usesFemalePulseExperience } from './genderAccountPerks';

export type DisguiseWorld = 'pulse' | 'harbor';

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

export function resolveDisguiseWorld(section?: string | null): DisguiseWorld {
  return resolveSparkSection(section) === 'ember' ? 'harbor' : 'pulse';
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
  switch (world) {
    case 'pulse':
      if (gender && usesFemalePulseExperience(gender)) {
        return {
          world,
          name: 'Pulse',
          tagline: translate(lang, 'disguiseWorld.pulseFemaleTagline'),
          unlockLabel: 'Spark',
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
        unlockLabel: 'Spark',
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
    case 'harbor':
      return {
        world,
        name: translate(lang, 'disguiseWorld.harborName'),
        tagline: translate(lang, 'disguiseWorld.harborTagline'),
        unlockLabel: translate(lang, 'disguiseWorld.harborUnlock'),
        accent: harborBrand.accent,
        accentBright: harborBrand.accentBright,
        accentSoft: harborBrand.accentSoft,
        accentBorder: harborBrand.accentBorder,
        navy: harborBrand.navy,
        homeTab: translate(lang, 'tabs.briefing'),
        trendingTab: translate(lang, 'tabs.markets'),
        searchTitle: translate(lang, 'disguiseWorld.searchHarbor'),
        feedLabel: translate(lang, 'disguiseWorld.harborFeedLabel'),
      };
    default: {
      const _exhaustive: never = world;
      return _exhaustive;
    }
  }
}
