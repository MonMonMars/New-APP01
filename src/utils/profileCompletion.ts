import { translate } from '../i18n';
import { AppLocale } from '../types/locale';
import { UserProfile, EMBER_PROMPT_OPTIONS } from '../types/profile';

export type ProfileTip = {
  id: string;
  label: string;
  done: boolean;
  suggestion?: string;
};

type TipId =
  | 'photos'
  | 'bio'
  | 'prompts'
  | 'interests'
  | 'intent'
  | 'emberPrompt'
  | 'photo'
  | 'person'
  | 'age';

function tipText(locale: AppLocale, id: TipId, field: 'label' | 'suggestion'): string {
  return translate(locale, `profileCompletion.${id}.${field}`);
}

export function computeProfileCompletion(
  user: UserProfile,
  locale: AppLocale = 'en',
): {
  score: number;
  tips: ProfileTip[];
} {
  const tips: ProfileTip[] = [
    {
      id: 'photos',
      label: tipText(locale, 'photos', 'label'),
      done: user.photos.length >= 3,
      suggestion: tipText(locale, 'photos', 'suggestion'),
    },
    {
      id: 'bio',
      label: tipText(locale, 'bio', 'label'),
      done: user.bio.trim().length >= 40,
      suggestion: tipText(locale, 'bio', 'suggestion'),
    },
    {
      id: 'prompts',
      label: tipText(locale, 'prompts', 'label'),
      done: (user.prompts?.length ?? 0) >= 2,
      suggestion: tipText(locale, 'prompts', 'suggestion'),
    },
    {
      id: 'interests',
      label: tipText(locale, 'interests', 'label'),
      done: user.interests.length >= 5,
      suggestion: tipText(locale, 'interests', 'suggestion'),
    },
    {
      id: 'intent',
      label: tipText(locale, 'intent', 'label'),
      done: Boolean(user.intent),
      suggestion: tipText(locale, 'intent', 'suggestion'),
    },
    {
      id: 'emberPrompt',
      label: tipText(locale, 'emberPrompt', 'label'),
      done:
        user.prompts?.some(
          (prompt) =>
            EMBER_PROMPT_OPTIONS.some((question) => question === prompt.question) &&
            prompt.answer.trim().length > 12,
        ) ?? false,
      suggestion: tipText(locale, 'emberPrompt', 'suggestion'),
    },
    {
      id: 'photo',
      label: tipText(locale, 'photo', 'label'),
      done: user.photoVerified === true,
      suggestion: tipText(locale, 'photo', 'suggestion'),
    },
    {
      id: 'person',
      label: tipText(locale, 'person', 'label'),
      done: user.personVerified === true,
      suggestion: tipText(locale, 'person', 'suggestion'),
    },
    {
      id: 'age',
      label: tipText(locale, 'age', 'label'),
      done: user.ageVerified === true,
      suggestion: tipText(locale, 'age', 'suggestion'),
    },
  ];

  const doneCount = tips.filter((tip) => tip.done).length;
  const score = Math.round((doneCount / tips.length) * 100);
  return { score, tips };
}
