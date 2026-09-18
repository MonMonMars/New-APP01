import { AppLocale } from '../types/locale';
import { DiscoverFilter, ShowMePreference, SparkSection } from '../types/preferences';
import {
  EmberDiscretion,
  EmberSeeking,
  Orientation,
  ProfileGender,
  RelationshipIntent,
} from '../types/profile';
import { translate } from './index';

export function getGenderLabel(locale: AppLocale, gender: ProfileGender): string {
  const map: Record<ProfileGender, string> = {
    woman: translate(locale, 'preferences.genderWoman'),
    man: translate(locale, 'preferences.genderMan'),
    nonbinary: translate(locale, 'preferences.genderNonbinary'),
  };
  return map[gender];
}

export function getOrientationLabel(locale: AppLocale, orientation: Orientation): string {
  const map: Record<Orientation, string> = {
    straight: translate(locale, 'preferences.orientationStraight'),
    gay: translate(locale, 'preferences.orientationGay'),
    lesbian: translate(locale, 'preferences.orientationLesbian'),
    bisexual: translate(locale, 'preferences.orientationBisexual'),
    pansexual: translate(locale, 'preferences.orientationPansexual'),
    queer: translate(locale, 'preferences.orientationQueer'),
    asexual: translate(locale, 'preferences.orientationAsexual'),
    other: translate(locale, 'preferences.orientationOther'),
  };
  return map[orientation];
}

export function getRelationshipIntentLabel(locale: AppLocale, intent: RelationshipIntent): string {
  const map: Record<RelationshipIntent, string> = {
    long_term: translate(locale, 'preferences.intentLongTerm'),
    short_term: translate(locale, 'preferences.intentCasual'),
    new_friends: translate(locale, 'preferences.intentFriends'),
    not_sure: translate(locale, 'preferences.intentFiguring'),
  };
  return map[intent];
}

export function getProfileIntentLabel(locale: AppLocale, intent: RelationshipIntent): string {
  const map: Record<RelationshipIntent, string> = {
    long_term: translate(locale, 'profile.intentLongTerm'),
    short_term: translate(locale, 'profile.intentShortTerm'),
    new_friends: translate(locale, 'profile.intentFriends'),
    not_sure: translate(locale, 'profile.intentNotSure'),
  };
  return map[intent];
}

export function getDiscoverFilterLabel(locale: AppLocale, filter: DiscoverFilter): string {
  const map: Record<DiscoverFilter, string> = {
    active_today: translate(locale, 'preferences.filterActiveToday'),
    new_here: translate(locale, 'preferences.filterNewHere'),
    has_bio: translate(locale, 'preferences.filterHasBio'),
    verified: translate(locale, 'preferences.filterVerified'),
  };
  return map[filter];
}

export function getSparkSectionLabel(locale: AppLocale, section: SparkSection): string {
  return section === 'ember'
    ? translate(locale, 'preferences.ember')
    : translate(locale, 'preferences.spark');
}

export function getSparkSectionHint(locale: AppLocale, section: SparkSection): string {
  return section === 'ember'
    ? translate(locale, 'preferences.emberHint')
    : translate(locale, 'preferences.sparkHint');
}

export function getShowMeLabel(_locale: AppLocale, showMe: ShowMePreference): string {
  switch (showMe) {
    case 'women':
      return translate(_locale, 'preferences.genderWoman');
    case 'men':
      return translate(_locale, 'preferences.genderMan');
    case 'everyone':
      return translate(_locale, 'preferences.showMeEveryone');
    default: {
      const _exhaustive: never = showMe;
      return _exhaustive;
    }
  }
}

export function formatSearchRadiusLocalized(locale: AppLocale, miles: number): string {
  if (miles >= 9999) {
    return translate(locale, 'preferences.anywhere');
  }
  return translate(locale, 'preferences.miles', { n: miles });
}

export function getEmberDiscretionLabel(locale: AppLocale, value: EmberDiscretion): string {
  const map: Record<EmberDiscretion, string> = {
    open: translate(locale, 'editProfile.emberDiscretionOpen'),
    careful: translate(locale, 'editProfile.emberDiscretionCareful'),
    hidden: translate(locale, 'editProfile.emberDiscretionHidden'),
  };
  return map[value];
}

export function getEmberSeekingLabel(locale: AppLocale, value: EmberSeeking): string {
  const map: Record<EmberSeeking, string> = {
    online: translate(locale, 'editProfile.emberSeekingOnline'),
    travel: translate(locale, 'editProfile.emberSeekingTravel'),
    ongoing: translate(locale, 'editProfile.emberSeekingOngoing'),
    light: translate(locale, 'editProfile.emberSeekingLight'),
  };
  return map[value];
}

export function getEmberStatusLabel(locale: AppLocale, status: 'married' | 'divorced'): string {
  return status === 'married'
    ? translate(locale, 'editProfile.statusMarried')
    : translate(locale, 'editProfile.statusDivorced');
}

export function getSparkSectionEmpty(
  locale: AppLocale,
  section: SparkSection,
): { title: string; subtitle: string } {
  if (section === 'ember') {
    return {
      title: translate(locale, 'preferences.noMorePeople'),
      subtitle: translate(locale, 'preferences.emberEmpty'),
    };
  }
  return {
    title: translate(locale, 'preferences.noMorePeople'),
    subtitle: translate(locale, 'preferences.sparkEmpty'),
  };
}
