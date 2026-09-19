import { translate } from '../i18n';
import { AppLocale } from '../types/locale';

export type LocalizedDateSuggestion = {
  id: string;
  label: string;
  message: string;
};

export function getLocalizedDateSuggestions(locale: AppLocale): LocalizedDateSuggestion[] {
  return [
    {
      id: 'coffee',
      label: translate(locale, 'chat.dateSuggestionCoffee'),
      message: translate(locale, 'chat.dateSuggestionCoffeeMsg'),
    },
    {
      id: 'walk',
      label: translate(locale, 'chat.dateSuggestionWalk'),
      message: translate(locale, 'chat.dateSuggestionWalkMsg'),
    },
    {
      id: 'food',
      label: translate(locale, 'chat.dateSuggestionFood'),
      message: translate(locale, 'chat.dateSuggestionFoodMsg'),
    },
    {
      id: 'drinks',
      label: translate(locale, 'chat.dateSuggestionDrinks'),
      message: translate(locale, 'chat.dateSuggestionDrinksMsg'),
    },
    {
      id: 'activity',
      label: translate(locale, 'chat.dateSuggestionActivity'),
      message: translate(locale, 'chat.dateSuggestionActivityMsg'),
    },
    {
      id: 'video',
      label: translate(locale, 'chat.dateSuggestionVideo'),
      message: translate(locale, 'chat.dateSuggestionVideoMsg'),
    },
    {
      id: 'brunch',
      label: translate(locale, 'chat.dateSuggestionBrunch'),
      message: translate(locale, 'chat.dateSuggestionBrunchMsg'),
    },
    {
      id: 'museum',
      label: translate(locale, 'chat.dateSuggestionMuseum'),
      message: translate(locale, 'chat.dateSuggestionMuseumMsg'),
    },
    {
      id: 'live',
      label: translate(locale, 'chat.dateSuggestionLive'),
      message: translate(locale, 'chat.dateSuggestionLiveMsg'),
    },
  ];
}
