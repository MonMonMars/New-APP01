import { WeatherSnapshot } from '../data/disguiseWeather';
import { AppLocale } from '../types/locale';
import { DiscoverFilter, ShowMePreference, SparkSection } from '../types/preferences';
import {
  EmberAvailability,
  EmberDiscretion,
  EmberSeeking,
  emberHidesCity,
  Orientation,
  ProfileGender,
  RelationshipIntent,
  RelationshipStatus,
} from '../types/profile';
import { SUGGESTED_INTERESTS } from '../data/suggestedInterests';
import { PASSPORT_CITIES } from '../types/preferences';
import {
  EMBER_PROMPT_OPTIONS,
  HINGE_PROMPT_OPTIONS,
  VOICE_PROMPT_QUESTIONS,
} from '../types/profile';
import { OPENING_MOVE_SUGGESTIONS } from '../utils/openingMove';
import { SparkPlusPlan } from '../types/subscription';
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

const PASSPORT_CITY_I18N_KEYS: Record<(typeof PASSPORT_CITIES)[number], string> = {
  'New York, NY': 'passportCities.newYork',
  'Los Angeles, CA': 'passportCities.losAngeles',
  'Chicago, IL': 'passportCities.chicago',
  'Miami, FL': 'passportCities.miami',
  'Austin, TX': 'passportCities.austin',
  'San Francisco, CA': 'passportCities.sanFrancisco',
  'London, UK': 'passportCities.london',
  'Paris, France': 'passportCities.paris',
  'Tokyo, Japan': 'passportCities.tokyo',
  'Sydney, Australia': 'passportCities.sydney',
};

export function getPassportCityLabel(locale: AppLocale, city: string): string {
  const key = PASSPORT_CITY_I18N_KEYS[city as (typeof PASSPORT_CITIES)[number]];
  return key ? translate(locale, key) : city;
}

export function getSparkPlusPlanLabel(locale: AppLocale, plan: SparkPlusPlan): string {
  switch (plan) {
    case 'weekly':
      return translate(locale, 'sparkPlus.planWeekly');
    case 'monthly':
      return translate(locale, 'sparkPlus.planMonthly');
    case 'annual':
      return translate(locale, 'sparkPlus.planAnnual');
    default: {
      const _exhaustive: never = plan;
      return _exhaustive;
    }
  }
}

export function formatSparkPlusPerMonth(locale: AppLocale, perMonth: string): string {
  if (perMonth === '—') {
    return perMonth;
  }
  const price = perMonth.replace(/\/mo$/, '');
  return translate(locale, 'sparkPlus.perMonth', { price });
}

export function formatOpeningMoveDisplay(locale: AppLocale, text: string): string {
  const tryMatch = TRY_ANSWER_PREFIX.exec(text);
  if (tryMatch) {
    return translate(locale, 'openingMove.tryAnswer', { answer: tryMatch[1] });
  }
  return getOpeningMoveSuggestionLabel(locale, text);
}

export function getEmberLocationLabel(
  locale: AppLocale,
  profile: { city?: string; distanceMiles: number; emberDiscretion?: EmberDiscretion | null },
): string {
  if (emberHidesCity(profile.emberDiscretion)) {
    return translate(locale, 'ember.nearby');
  }
  const miles = translate(locale, 'preferences.miles', { n: profile.distanceMiles });
  if (profile.emberDiscretion === 'careful') {
    return miles;
  }
  return profile.city ? `${profile.city} · ${miles}` : miles;
}

const WEATHER_CONDITION_KEYS: Record<string, string> = {
  'Clear sky': 'disguiseWeather.conditionClear',
  'Partly cloudy': 'disguiseWeather.conditionPartlyCloudy',
  Cloudy: 'disguiseWeather.conditionCloudy',
  'Rain showers': 'disguiseWeather.conditionRain',
  Thunderstorms: 'disguiseWeather.conditionStorm',
  Windy: 'disguiseWeather.conditionWind',
};

const WEATHER_DAY_KEYS: Record<string, string> = {
  Today: 'disguiseWeather.today',
  Sun: 'disguiseWeather.daySun',
  Mon: 'disguiseWeather.dayMon',
  Tue: 'disguiseWeather.dayTue',
  Wed: 'disguiseWeather.dayWed',
  Thu: 'disguiseWeather.dayThu',
  Fri: 'disguiseWeather.dayFri',
  Sat: 'disguiseWeather.daySat',
  Day: 'disguiseWeather.dayGeneric',
};

const WEATHER_UPDATED_KEYS: Record<string, string> = {
  'Live · Open-Meteo': 'disguiseWeather.updatedLive',
  'Updated just now': 'disguiseWeather.updatedJustNow',
};

export function getWeatherConditionLabel(locale: AppLocale, condition: string): string {
  const key = WEATHER_CONDITION_KEYS[condition];
  return key ? translate(locale, key) : condition;
}

export function getWeatherDayLabel(locale: AppLocale, label: string): string {
  const key = WEATHER_DAY_KEYS[label];
  return key ? translate(locale, key) : label;
}

export function getWeatherUpdatedLabel(locale: AppLocale, label: string): string {
  const key = WEATHER_UPDATED_KEYS[label];
  return key ? translate(locale, key) : label;
}

export function localizeWeatherSnapshot(
  locale: AppLocale,
  snapshot: WeatherSnapshot,
  passportCity?: string,
): WeatherSnapshot {
  const city = passportCity
    ? getPassportCityLabel(locale, passportCity).split(/[,，]/)[0]?.trim() ||
      getPassportCityLabel(locale, passportCity)
    : snapshot.city;

  return {
    ...snapshot,
    city,
    condition: getWeatherConditionLabel(locale, snapshot.condition),
    updatedLabel: getWeatherUpdatedLabel(locale, snapshot.updatedLabel),
    forecast: snapshot.forecast.map((day) => ({
      ...day,
      label: getWeatherDayLabel(locale, day.label),
    })),
  };
}

const PULSE_CATEGORY_KEYS: Record<string, string> = {
  Tech: 'pulseCategory.tech',
  Business: 'pulseCategory.business',
  Local: 'pulseCategory.local',
  Lifestyle: 'pulseCategory.lifestyle',
  Science: 'pulseCategory.science',
  Culture: 'pulseCategory.culture',
  Creators: 'pulseCategory.creators',
  Entertainment: 'pulseCategory.entertainment',
  News: 'pulseCategory.news',
  Tarot: 'pulseCategory.tarot',
  星座: 'pulseCategory.zodiac',
  Food: 'pulseCategory.food',
  Film: 'pulseCategory.film',
  Music: 'pulseCategory.music',
  Style: 'pulseCategory.style',
  Weather: 'pulseCategory.weather',
  Climate: 'pulseCategory.climate',
  Community: 'pulseCategory.community',
  Markets: 'pulseCategory.markets',
  Finance: 'pulseCategory.finance',
};

const DISGUISED_PROFILE_HINT_KEYS: Record<string, string> = {
  tapMaskedPhoto: 'disguisedProfile.hintTapMaskedPhoto',
  tapAvatarThread: 'disguisedProfile.hintTapAvatarThread',
  tapBreakingAvatar: 'disguisedProfile.hintTapBreakingAvatar',
};

const PULSE_TOPIC_KEYS: Record<string, string> = {
  '#WeekendPlans': 'pulseTopic.weekendPlans',
  '#TechNews': 'pulseTopic.techNews',
  '#CoffeeShops': 'pulseTopic.coffeeShops',
  '#CityLife': 'pulseTopic.cityLife',
  '#DesignTips': 'pulseTopic.designTips',
  '#MarketWatch': 'pulseTopic.marketWatch',
  '#AIInvesting': 'pulseTopic.aiInvesting',
  '#RemoteWork': 'pulseTopic.remoteWork',
  '#EURegulation': 'pulseTopic.euRegulation',
  '#NightTransit': 'pulseTopic.nightTransit',
  '#StartupJobs': 'pulseTopic.startupJobs',
  '#WeekendEats': 'pulseTopic.weekendEats',
  '#ClimateTech': 'pulseTopic.climateTech',
  '#BookClub': 'pulseTopic.bookClub',
  '#TransitTalk': 'pulseTopic.transitTalk',
  '#OnDeviceAI': 'pulseTopic.onDeviceAi',
  '#HeatWave': 'pulseTopic.heatWave',
  '#CarFreeCities': 'pulseTopic.carFreeCities',
  '#IndieBooks': 'pulseTopic.indieBooks',
  '#SolarHome': 'pulseTopic.solarHome',
  '#Weather': 'pulseTopic.weather',
  '#Zodiac': 'pulseTopic.zodiac',
  '#Tarot': 'pulseTopic.tarot',
  '#Film': 'pulseTopic.film',
  '#Music': 'pulseTopic.music',
  '#Style': 'pulseTopic.style',
};

const DISGUISE_OVERLAY_SNIPPET_KEYS: Record<string, string> = {
  LIVE: 'profile.live',
  AD: 'disguiseOverlay.adBadge',
  BREAKING: 'disguiseOverlay.breaking',
};

export function formatRelativeTimeLocalized(locale: AppLocale, iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (minutes < 60) {
    return translate(locale, 'time.minutesAgo', { n: minutes });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return translate(locale, 'time.hoursAgo', { n: hours });
  }
  return translate(locale, 'time.daysAgo', { n: Math.floor(hours / 24) });
}

export function formatHoursAgoLocalized(locale: AppLocale, hours: number): string {
  if (hours <= 1) {
    return translate(locale, 'time.justNow');
  }
  return translate(locale, 'time.hoursAgo', { n: hours });
}

const TIME_AGO_LABEL_KEYS: Record<string, string> = {
  'Just now': 'time.justNow',
  "Editor's pick": 'disguiseTrending.editorsPick',
};

export function localizeTimeAgoLabel(locale: AppLocale, label: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    return label;
  }

  const staticKey = TIME_AGO_LABEL_KEYS[trimmed];
  if (staticKey) {
    return translate(locale, staticKey);
  }

  const minRead = trimmed.match(/^(\d+)\s*min read$/i);
  if (minRead) {
    return translate(locale, 'time.minRead', { n: Number(minRead[1]) });
  }

  const withAgo = trimmed.match(/^(\d+)\s*([mhd])\s*ago$/i);
  if (withAgo) {
    const n = Number(withAgo[1]);
    const unit = withAgo[2].toLowerCase();
    if (unit === 'm') {
      return translate(locale, 'time.minutesAgo', { n });
    }
    if (unit === 'h') {
      return translate(locale, 'time.hoursAgo', { n });
    }
    if (unit === 'd') {
      return translate(locale, 'time.daysAgo', { n });
    }
  }

  const compact = trimmed.match(/^(\d+)\s*([mhd])$/i);
  if (compact) {
    const n = Number(compact[1]);
    const unit = compact[2].toLowerCase();
    if (unit === 'm') {
      return translate(locale, 'time.minutesAgo', { n });
    }
    if (unit === 'h') {
      return translate(locale, 'time.hoursAgo', { n });
    }
    if (unit === 'd') {
      return translate(locale, 'time.daysAgo', { n });
    }
  }

  return label;
}

export function getMarketVolumeLabel(locale: AppLocale, volumeLabel: string): string {
  const value = volumeLabel.replace(/\s*vol$/i, '').trim();
  return translate(locale, 'disguiseMarkets.volumeLabel', { value });
}

export function getPulseCategoryLabel(locale: AppLocale, category: string): string {
  const key = PULSE_CATEGORY_KEYS[category];
  return key ? translate(locale, key) : category;
}

export function getDisguisedProfileHintLabel(locale: AppLocale, hintKey: string): string {
  const key = DISGUISED_PROFILE_HINT_KEYS[hintKey];
  return key ? translate(locale, key) : hintKey;
}

export function getDisguisedSourceLabel(locale: AppLocale, sourceLabel: string): string {
  if (sourceLabel === 'Sponsored') {
    return translate(locale, 'disguiseAd.sponsored');
  }
  return sourceLabel;
}

export function getActivityAlertText(locale: AppLocale, alertId: string, fallback: string): string {
  const key = `activityAlert.${alertId}`;
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}

export function getPulseTopicLabel(locale: AppLocale, topic: string): string {
  const key = PULSE_TOPIC_KEYS[topic];
  if (key) {
    return translate(locale, key);
  }
  return topic.replace('#', '');
}

export function getDisguiseOverlaySnippet(locale: AppLocale, snippet: string): string {
  const firstWord = snippet.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  const key = DISGUISE_OVERLAY_SNIPPET_KEYS[firstWord];
  return key ? translate(locale, key) : snippet;
}

const TRENDING_CHIP_LABEL_KEYS: Record<string, string> = {
  'For you': 'disguiseTrending.chipForYou',
  Weather: 'disguiseTrending.weather',
  Markets: 'disguiseTrending.chipMarkets',
  Tech: 'pulseCategory.tech',
  Local: 'pulseCategory.local',
  Food: 'pulseCategory.food',
  Weekend: 'disguiseTrending.chipWeekend',
  星座: 'pulseCategory.zodiac',
  Tarot: 'pulseCategory.tarot',
  Film: 'pulseCategory.film',
  Music: 'pulseCategory.music',
  Style: 'pulseCategory.style',
};

export function getTrendingChipLabel(locale: AppLocale, label: string): string {
  const key = TRENDING_CHIP_LABEL_KEYS[label];
  return key ? translate(locale, key) : label;
}

const TRENDING_CHANGE_LABEL_KEYS: Record<string, string> = {
  Live: 'disguiseTrending.changeLive',
  New: 'disguiseTrending.changeNew',
  Rising: 'disguiseTrending.changeRising',
};

export function getTrendingChangeLabel(locale: AppLocale, label: string): string {
  const key = TRENDING_CHANGE_LABEL_KEYS[label];
  return key ? translate(locale, key) : label;
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
