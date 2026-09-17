import { useCallback } from 'react';

import { useAppLocale } from '../hooks/useAppLocale';
import { AppLocale } from '../types/locale';
import { en } from './en';
import { TranslationParams } from './types';
import { zhTw } from './zh-TW';

const dictionaries: Record<AppLocale, Record<string, unknown>> = {
  en,
  'zh-TW': zhTw,
};

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template,
  );
}

export function translate(
  locale: AppLocale,
  key: string,
  params?: TranslationParams,
): string {
  const localized = getNested(dictionaries[locale], key);
  const fallback = getNested(dictionaries.en, key);
  const template = localized ?? fallback ?? key;
  return interpolate(template, params);
}

export function useTranslation() {
  const { locale, setLocale, isZh } = useAppLocale();

  const t = useCallback(
    (key: string, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  );

  return { t, locale, setLocale, isZh };
}

export { en, zhTw };
