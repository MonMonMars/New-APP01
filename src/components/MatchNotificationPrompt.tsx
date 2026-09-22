import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';

export function MatchNotificationPrompt() {
  const { t } = useTranslation();
  const {
    matchNotificationPromptVisible,
    dismissMatchNotificationPrompt,
    acceptMatchNotificationPrompt,
  } = useApp();
  const showingRef = useRef(false);

  useEffect(() => {
    if (!matchNotificationPromptVisible || showingRef.current) {
      return;
    }
    showingRef.current = true;
    Alert.alert(t('notifications.matchPromptTitle'), t('notifications.matchPromptBody'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
        onPress: () => {
          showingRef.current = false;
          dismissMatchNotificationPrompt();
        },
      },
      {
        text: t('notifications.matchPromptEnable'),
        onPress: () => {
          showingRef.current = false;
          void acceptMatchNotificationPrompt();
        },
      },
    ]);
  }, [
    acceptMatchNotificationPrompt,
    dismissMatchNotificationPrompt,
    matchNotificationPromptVisible,
    t,
  ]);

  return null;
}
