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
): DisguiseWorldMeta {
  const world = resolveDisguiseWorld(section);
  switch (world) {
    case 'pulse':
      if (gender && usesFemalePulseExperience(gender)) {
        return {
          world,
          name: 'Pulse',
          tagline: '星座 · Tarot & Entertainment',
          unlockLabel: 'Spark',
          accent: pulseBrand.accent,
          accentBright: pulseBrand.accentBright,
          accentSoft: pulseBrand.accentSoft,
          accentBorder: pulseBrand.accentBorder,
          navy: pulseBrand.navy,
          homeTab: 'Home',
          trendingTab: 'Cosmos',
          searchTitle: 'Search Pulse',
          feedLabel: 'Cosmos & culture',
        };
      }
      return {
        world,
        name: 'Pulse',
        tagline: 'World & Local News',
        unlockLabel: 'Spark',
        accent: pulseBrand.accent,
        accentBright: pulseBrand.accentBright,
        accentSoft: pulseBrand.accentSoft,
        accentBorder: pulseBrand.accentBorder,
        navy: pulseBrand.navy,
        homeTab: 'Home',
        trendingTab: 'Trending',
        searchTitle: 'Search Pulse',
        feedLabel: 'Top stories',
      };
    case 'harbor':
      return {
        world,
        name: 'Harbor',
        tagline: 'Markets & Briefing',
        unlockLabel: 'Ember',
        accent: harborBrand.accent,
        accentBright: harborBrand.accentBright,
        accentSoft: harborBrand.accentSoft,
        accentBorder: harborBrand.accentBorder,
        navy: harborBrand.navy,
        homeTab: 'Briefing',
        trendingTab: 'Markets',
        searchTitle: 'Search Harbor',
        feedLabel: 'Market briefing',
      };
    default: {
      const _exhaustive: never = world;
      return _exhaustive;
    }
  }
}
