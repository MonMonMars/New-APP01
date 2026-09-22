import { getAllProfiles, getIncomingLikeProfilesForSection } from '../data/profiles';
import { matchesSparkSection, resolveSparkSection, ShowMePreference, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { filterProfilesForShowMe } from './showMeFilter';

/** Incoming likes + section-matched catalog, deduped and gated by Show me + photo availability. */
export function buildSectionProfilePool(
  section: SparkSection | string | null | undefined,
  showMe: ShowMePreference,
  excluded: Set<string>,
): Profile[] {
  const resolved = resolveSparkSection(section);
  const incoming = getIncomingLikeProfilesForSection(resolved);
  const rest = getAllProfiles().filter((profile) => matchesSparkSection(profile, resolved));
  const merged = [...incoming, ...rest];
  const unique = merged.filter(
    (profile, index, list) => list.findIndex((item) => item.id === profile.id) === index,
  );
  const eligible = unique.filter(
    (profile) => !excluded.has(profile.id) && profile.photos.length > 0,
  );
  return filterProfilesForShowMe(eligible, showMe);
}
