import { translate } from '../i18n';
import { AppLocale } from '../types/locale';

/** Hinge Prompt Feedback–inspired tips (rule-based, no AI). */
export function getPromptFeedback(answer: string, locale: AppLocale): string | null {
  const trimmed = answer.trim();
  if (trimmed.length === 0) {
    return translate(locale, 'promptFeedback.empty');
  }
  if (trimmed.length < 12) {
    return translate(locale, 'promptFeedback.tooShort');
  }
  if (/^(yes|no|idk|nothing|n\/a)$/i.test(trimmed)) {
    return translate(locale, 'promptFeedback.oneWord');
  }
  if (!/[.!?]/.test(trimmed) && trimmed.length < 40) {
    return translate(locale, 'promptFeedback.noPunctuation');
  }
  if (/^(i like|i love|i enjoy)/i.test(trimmed) && trimmed.split(' ').length < 8) {
    return translate(locale, 'promptFeedback.genericStart');
  }
  return null;
}
