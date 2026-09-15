import { incomingLikeProfiles, mockProfiles } from '../data/profiles';
import { Profile } from '../types/profile';

export function profileIdFromPostId(postId: string): string | undefined {
  if (postId === 'disguised-user') {
    return undefined;
  }
  if (postId.startsWith('disguised-profile-')) {
    return postId.replace('disguised-profile-', '');
  }
  if (postId.startsWith('disguised-')) {
    return postId.replace('disguised-', '');
  }
  return undefined;
}

/** Map disguise reporter / card ids back to a dating profile when woven from seed data. */
export function resolveDisguiseProfileId(reporterId: string): string | undefined {
  if (reporterId === 'disguised-user') {
    return undefined;
  }

  const disguisedProfile = reporterId.match(/^disguised-profile-(.+)$/);
  if (disguisedProfile) {
    return disguisedProfile[1];
  }

  const disguised = reporterId.match(/^disguised-(.+)$/);
  if (disguised) {
    return disguised[1];
  }

  return undefined;
}

export function resolveDisguiseProfile(reporterId: string, profileId?: string): Profile | null {
  const id = profileId ?? resolveDisguiseProfileId(reporterId);
  if (!id) {
    return null;
  }

  return (
    incomingLikeProfiles.find((profile) => profile.id === id) ??
    mockProfiles.find((profile) => profile.id === id) ??
    null
  );
}
