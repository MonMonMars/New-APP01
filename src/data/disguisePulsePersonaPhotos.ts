import { alertDemoProfileId } from './disguiseAlertProfileLinks';
import {
  reporterDemoProfileId,
  socialAuthorDemoProfileId,
} from './disguiseReporterProfileLinks';
import { getProfileById } from './profiles';
import type { DisguiseAlert, NewsPost, NewsReporter, SocialPost } from './disguiseFeed';

/** Activity-only personas (not in social author map). */
const ACTIVITY_PERSONA_PROFILE_IDS: Record<string, string> = {
  'Noor H.': '54',
  'Dana W.': '71',
  'Taylor B.': '100',
  'Chris P.': '108',
  'Morgan S.': '77',
};

export function resolvePulsePersonaProfileId(name: string): string | undefined {
  const trimmed = name.trim();
  return (
    alertDemoProfileId(trimmed) ??
    socialAuthorDemoProfileId(trimmed) ??
    ACTIVITY_PERSONA_PROFILE_IDS[trimmed]
  );
}

export function demoPhotosForProfileId(profileId: string): string[] {
  return getProfileById(profileId)?.photos ?? [];
}

export function demoAvatarForPersonName(name: string): string | undefined {
  const profileId = resolvePulsePersonaProfileId(name);
  if (!profileId) {
    return undefined;
  }
  return demoPhotosForProfileId(profileId)[0];
}

export function applyReporterDemoPhotos(reporter: NewsReporter): NewsReporter {
  const profileId = reporter.profileId ?? reporterDemoProfileId(reporter.id);
  const photos = profileId ? demoPhotosForProfileId(profileId) : [];
  if (photos.length === 0) {
    return reporter;
  }
  return {
    ...reporter,
    profileId,
    avatarUrl: photos[0],
    photos,
  };
}

export function hydrateNewsPost(post: NewsPost): NewsPost {
  return {
    ...post,
    reporters: post.reporters.map(applyReporterDemoPhotos),
  };
}

export function hydrateSocialPost(post: SocialPost): SocialPost {
  const profileId = post.datingProfileId ?? socialAuthorDemoProfileId(post.author);
  if (!profileId) {
    return post;
  }
  const photos = demoPhotosForProfileId(profileId);
  if (photos.length === 0) {
    return { ...post, datingProfileId: profileId };
  }
  return {
    ...post,
    datingProfileId: profileId,
    avatarUrl: photos[0],
  };
}

export function hydrateDisguiseAlert(alert: DisguiseAlert): DisguiseAlert {
  if (!alert.person) {
    return alert;
  }
  const profileId = resolvePulsePersonaProfileId(alert.person.name);
  const avatarUrl = demoAvatarForPersonName(alert.person.name);
  if (!avatarUrl) {
    return alert;
  }
  return {
    ...alert,
    person: {
      ...alert.person,
      avatarUrl,
      datingProfileId: profileId ?? alert.person.datingProfileId,
    },
  };
}
