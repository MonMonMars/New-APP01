import { FeedItem, NewsReporter } from '../data/disguiseFeed';
import { SparkSection } from '../types/preferences';
import { pinnedReporterProfileId, profileIdFromPostId, resolveDisguiseProfileId } from './resolveDisguiseProfile';

function actionedProfileIds(
  likedIds: Set<string>,
  passedIds: Set<string>,
  superLikedIds: Set<string>,
): Set<string> {
  const ids = new Set<string>();
  likedIds.forEach((id) => ids.add(id));
  passedIds.forEach((id) => ids.add(id));
  superLikedIds.forEach((id) => ids.add(id));
  return ids;
}

function reporterProfileId(reporter: NewsReporter, section?: SparkSection | string | null): string | undefined {
  return (
    reporter.profileId ??
    resolveDisguiseProfileId(reporter.id) ??
    pinnedReporterProfileId(reporter.id, section)
  );
}

/** Drop disguised profile cards and news reporter avatars after mini-window like / pass / super-like. */
export function filterActionedDisguiseFeed(
  items: FeedItem[],
  likedIds: Set<string>,
  passedIds: Set<string>,
  superLikedIds: Set<string>,
  section?: SparkSection | string | null,
): FeedItem[] {
  const actioned = actionedProfileIds(likedIds, passedIds, superLikedIds);

  return items.flatMap((item) => {
    if (item.type === 'disguised_profile') {
      const profileId = item.profileId ?? profileIdFromPostId(item.id);
      if (profileId && actioned.has(profileId)) {
        return [];
      }
      return [item];
    }

    if (item.type === 'news') {
      const reporters = item.reporters.filter((reporter) => {
        const profileId = reporterProfileId(reporter, section);
        return !profileId || !actioned.has(profileId);
      });
      if (reporters.length === item.reporters.length) {
        return [item];
      }
      return [{ ...item, reporters }];
    }

    return [item];
  });
}
