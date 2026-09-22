import type { AppLocale } from '../types/locale';

export type TranslationParams = Record<string, string | number>;

export type TranslationDictionary = Record<string, unknown>;

export type LocaleStrings = Record<AppLocale, TranslationDictionary>;
