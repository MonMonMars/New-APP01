import { AppLocale } from '../types/locale';
import { DiscoverFilter, ShowMePreference, SparkSection } from '../types/preferences';
import {
  EmberAvailability,
  EmberDiscretion,
  EmberSeeking,
  Orientation,
  ProfileGender,
  RelationshipIntent,
  RelationshipStatus,
} from '../types/profile';
import { SUGGESTED_INTERESTS } from '../data/suggestedInterests';
import {
  EMBER_PROMPT_OPTIONS,
  HINGE_PROMPT_OPTIONS,
  VOICE_PROMPT_QUESTIONS,
} from '../types/profile';
import { OPENING_MOVE_SUGGESTIONS } from '../utils/openingMove';
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

export function getEmberRelationshipLabel(
  locale: AppLocale,
  status?: RelationshipStatus | null,
): string | null {
  switch (status) {
    case 'married':
    case 'divorced':
      return getEmberStatusLabel(locale, status);
    case 'single':
    case undefined:
    case null:
      return null;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function getEmberAvailabilityLabel(locale: AppLocale, value: EmberAvailability): string {
  const map: Record<EmberAvailability, string> = {
    evenings: translate(locale, 'editProfile.emberAvailEvenings'),
    weekends: translate(locale, 'editProfile.emberAvailWeekends'),
    flexible: translate(locale, 'editProfile.emberAvailFlexible'),
  };
  return map[value];
}

export function getEmberDiscretionHint(locale: AppLocale, value: EmberDiscretion): string {
  const map: Record<EmberDiscretion, string> = {
    open: translate(locale, 'editProfile.emberDiscretionOpenHint'),
    careful: translate(locale, 'editProfile.emberDiscretionCarefulHint'),
    hidden: translate(locale, 'editProfile.emberDiscretionHiddenHint'),
  };
  return map[value];
}

const INTEREST_I18N_KEYS: Record<(typeof SUGGESTED_INTERESTS)[number], string> = {
  Coffee: 'interestTags.coffee',
  Design: 'interestTags.design',
  Hiking: 'interestTags.hiking',
  Photography: 'interestTags.photography',
  'Live music': 'interestTags.liveMusic',
  Cooking: 'interestTags.cooking',
  Yoga: 'interestTags.yoga',
  Travel: 'interestTags.travel',
  Art: 'interestTags.art',
  Running: 'interestTags.running',
  Wine: 'interestTags.wine',
  Gaming: 'interestTags.gaming',
  Reading: 'interestTags.reading',
  Dogs: 'interestTags.dogs',
  Cats: 'interestTags.cats',
  Film: 'interestTags.film',
  Brunch: 'interestTags.brunch',
  Fitness: 'interestTags.fitness',
  Museums: 'interestTags.museums',
  Tech: 'interestTags.tech',
  Dancing: 'interestTags.dancing',
  Surfing: 'interestTags.surfing',
  Podcasts: 'interestTags.podcasts',
  Fashion: 'interestTags.fashion',
};

export function getInterestLabel(locale: AppLocale, interest: string): string {
  const key = INTEREST_I18N_KEYS[interest as (typeof SUGGESTED_INTERESTS)[number]];
  return key ? translate(locale, key) : interest;
}

const PROMPT_QUESTION_I18N_KEYS: Record<string, string> = {
  [HINGE_PROMPT_OPTIONS[0]]: 'hingePrompts.mySimplePleasures',
  [HINGE_PROMPT_OPTIONS[1]]: 'hingePrompts.iGoCrazyFor',
  [HINGE_PROMPT_OPTIONS[2]]: 'hingePrompts.togetherWeCould',
  [HINGE_PROMPT_OPTIONS[3]]: 'hingePrompts.wayToWinMeOver',
  [HINGE_PROMPT_OPTIONS[4]]: 'hingePrompts.lifeGoalOfMine',
  [HINGE_PROMPT_OPTIONS[5]]: 'hingePrompts.mostControversialOpinion',
  [HINGE_PROMPT_OPTIONS[6]]: 'hingePrompts.imLookingFor',
  [HINGE_PROMPT_OPTIONS[7]]: 'hingePrompts.typicalSunday',
  [HINGE_PROMPT_OPTIONS[8]]: 'hingePrompts.bestTravelStory',
  [HINGE_PROMPT_OPTIONS[9]]: 'hingePrompts.greenFlagsILookFor',
  [EMBER_PROMPT_OPTIONS[0]]: 'emberPrompts.iValueDiscretionBecause',
  [EMBER_PROMPT_OPTIONS[1]]: 'emberPrompts.bestTimeToTalkIs',
  [EMBER_PROMPT_OPTIONS[2]]: 'emberPrompts.whatThisIsAndIsnt',
  [EMBER_PROMPT_OPTIONS[3]]: 'emberPrompts.imLookingFor',
  [VOICE_PROMPT_QUESTIONS[0]]: 'voicePromptQuestions.myPerfectSunday',
  [VOICE_PROMPT_QUESTIONS[1]]: 'voicePromptQuestions.wayToWinMeOver',
  [VOICE_PROMPT_QUESTIONS[2]]: 'voicePromptQuestions.iGeekOutOn',
  [VOICE_PROMPT_QUESTIONS[3]]: 'voicePromptQuestions.mostIrrationalFear',
  [VOICE_PROMPT_QUESTIONS[4]]: 'voicePromptQuestions.twoTruthsAndALie',
};

export function getPromptQuestionLabel(locale: AppLocale, question: string): string {
  const key = PROMPT_QUESTION_I18N_KEYS[question];
  return key ? translate(locale, key) : question;
}

const OPENING_MOVE_I18N_KEYS: Record<(typeof OPENING_MOVE_SUGGESTIONS)[number], string> = {
  [OPENING_MOVE_SUGGESTIONS[0]]: 'openingMoveSuggestions.goToWeekendPlan',
  [OPENING_MOVE_SUGGESTIONS[1]]: 'openingMoveSuggestions.hiddenGemInCity',
  [OPENING_MOVE_SUGGESTIONS[2]]: 'openingMoveSuggestions.coffeeOrCocktails',
  [OPENING_MOVE_SUGGESTIONS[3]]: 'openingMoveSuggestions.twoTruthsAndALie',
  [OPENING_MOVE_SUGGESTIONS[4]]: 'openingMoveSuggestions.bestMealLately',
  [OPENING_MOVE_SUGGESTIONS[5]]: 'openingMoveSuggestions.passionateAboutNow',
};

export function getOpeningMoveSuggestionLabel(locale: AppLocale, suggestion: string): string {
  const key = OPENING_MOVE_I18N_KEYS[suggestion as (typeof OPENING_MOVE_SUGGESTIONS)[number]];
  return key ? translate(locale, key) : suggestion;
}

const TRY_ANSWER_PREFIX = /^Try: "(.+)"$/;

export function formatOpeningMoveDisplay(locale: AppLocale, text: string): string {
  const tryMatch = TRY_ANSWER_PREFIX.exec(text);
  if (tryMatch) {
    return translate(locale, 'openingMove.tryAnswer', { answer: tryMatch[1] });
  }
  return getOpeningMoveSuggestionLabel(locale, text);
}

export function getBrandMarkLabel(
  locale: AppLocale,
  world: 'spark' | 'ember' | 'pulse' | 'harbor',
): string {
  switch (world) {
    case 'spark':
      return translate(locale, 'preferences.spark');
    case 'ember':
      return translate(locale, 'preferences.ember');
    case 'pulse':
      return translate(locale, 'tabs.pulse');
    case 'harbor':
      return translate(locale, 'disguiseWorld.harborName');
    default: {
      const _exhaustive: never = world;
      return _exhaustive;
    }
  }
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
