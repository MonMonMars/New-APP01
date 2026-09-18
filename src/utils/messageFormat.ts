import { translate } from '../i18n';
import { AppLocale } from '../types/locale';
import type { Message } from '../types/match';

const LEGACY_PHOTO_LABELS = new Set(['📷 Photo', 'Photo']);
const LEGACY_GIF_LABEL = 'GIF';

type MessagePreviewInput = Pick<
  Message,
  'text' | 'imageUrl' | 'isGif' | 'isVoiceNote' | 'voiceDurationSeconds'
>;

/** True when message.text is user caption (not a media placeholder). */
export function messageHasCaption(message: MessagePreviewInput): boolean {
  const text = message.text?.trim() ?? '';
  if (!text || message.isVoiceNote) {
    return false;
  }
  if (message.isGif || text === LEGACY_GIF_LABEL) {
    return false;
  }
  if (message.imageUrl && LEGACY_PHOTO_LABELS.has(text)) {
    return false;
  }
  return true;
}

export function messagePreviewText(message: MessagePreviewInput, locale: AppLocale): string {
  if (message.isVoiceNote && message.voiceDurationSeconds) {
    return translate(locale, 'chat.messageVoiceNote', { seconds: message.voiceDurationSeconds });
  }
  if (message.isGif || message.text === LEGACY_GIF_LABEL) {
    return translate(locale, 'chat.gif');
  }
  if (message.imageUrl) {
    const text = message.text?.trim() ?? '';
    if (!text || LEGACY_PHOTO_LABELS.has(text)) {
      return translate(locale, 'chat.photo');
    }
    return text;
  }
  return message.text?.trim() ?? '';
}

export function sentPhotoContext(locale: AppLocale): string {
  return translate(locale, 'chat.sentPhotoContext');
}
