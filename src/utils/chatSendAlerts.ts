import { Alert } from 'react-native';

import { TranslationParams } from '../i18n/types';
import { ChatSendOutcome } from '../types/chatSend';

type Translate = (key: string, params?: TranslationParams) => string;

export function alertChatSendOutcome(outcome: ChatSendOutcome, t: Translate): boolean {
  switch (outcome) {
    case 'sent':
      return true;
    case 'rate_limited':
      Alert.alert(t('chat.sendRateLimitedTitle'), t('chat.sendRateLimitedBody'));
      return false;
    case 'upload_failed':
      Alert.alert(t('chat.uploadFailedTitle'), t('chat.uploadFailedBody'));
      return false;
    case 'invalid':
      Alert.alert(t('chat.sendFailedTitle'), t('chat.sendFailedBody'));
      return false;
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
}
