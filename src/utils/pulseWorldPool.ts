import { DiscoveryPreferences, resolveSparkSection, ShowMePreference, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { buildSectionProfilePool } from './discoveryProfilePool';

export type PulseWorldPoolScope = Pick<
  DiscoveryPreferences,
  'sparkSection' | 'pulseDisplaySpark' | 'pulseDisplayEmber'
>;

/** Which Spark / Ember dating pools may appear in Pulse woven profiles. */
export function resolvePulseDisplaySections(scope: PulseWorldPoolScope): SparkSection[] {
  const includeSpark = scope.pulseDisplaySpark ?? true;
  const includeEmber = scope.pulseDisplayEmber ?? false;
  const sections: SparkSection[] = [];
  if (includeSpark) {
    sections.push('spark');
  }
  if (includeEmber) {
    sections.push('ember');
  }
  if (sections.length === 0) {
    sections.push(resolveSparkSection(scope.sparkSection));
  }
  return sections;
}

export function resolvePulseContextSection(
  preferred: SparkSection | undefined,
  scope: PulseWorldPoolScope,
): SparkSection {
  const allowed = resolvePulseDisplaySections(scope);
  if (preferred && allowed.includes(preferred)) {
    return preferred;
  }
  return allowed[0] ?? 'spark';
}

export function buildPulseProfilePool(
  scope: PulseWorldPoolScope,
  showMe: ShowMePreference,
  excluded: Set<string>,
): Profile[] {
  const sections = resolvePulseDisplaySections(scope);
  const merged: Profile[] = [];
  sections.forEach((section) => {
    merged.push(...buildSectionProfilePool(section, showMe, excluded));
  });
  return merged.filter(
    (profile, index, list) => list.findIndex((item) => item.id === profile.id) === index,
  );
}
