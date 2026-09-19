import { Alert } from 'react-native';

import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';
import { pickProfilePhoto } from './photoPicker';

type VerificationKind = 'photo' | 'person' | 'age';

function verificationCopy(kind: VerificationKind, locale: AppLocale) {
  switch (kind) {
    case 'photo':
      return {
        title: translate(locale, 'verification.photoTitle'),
        body: translate(locale, 'verification.photoBody'),
        action: translate(locale, 'verification.captureSelfie'),
        success: translate(locale, 'verification.photoSuccess'),
      };
    case 'person':
      return {
        title: translate(locale, 'verification.personTitle'),
        body: translate(locale, 'verification.personBody'),
        action: translate(locale, 'verification.confirm'),
        success: translate(locale, 'verification.personSuccess'),
      };
    case 'age':
      return {
        title: translate(locale, 'verification.ageTitle'),
        body: translate(locale, 'verification.ageBody'),
        action: translate(locale, 'common.continue'),
        success: translate(locale, 'verification.ageSuccess'),
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function runVerificationFlow(
  kind: VerificationKind,
  onSuccess: () => void,
  onOpenPolicy?: () => void,
  locale?: AppLocale | null,
): void {
  const resolvedLocale = resolveAppLocale(locale);
  const info = verificationCopy(kind, resolvedLocale);
  Alert.alert(info.title, info.body, [
    { text: translate(resolvedLocale, 'common.cancel'), style: 'cancel' },
    ...(onOpenPolicy
      ? [{ text: translate(resolvedLocale, 'verificationPolicy.headerTitle'), onPress: onOpenPolicy }]
      : []),
    {
      text: info.action,
      onPress: () => {
        void (async () => {
          if (kind === 'photo' || kind === 'person') {
            const uri = await pickProfilePhoto(resolvedLocale);
            if (!uri) {
              return;
            }
          }
          Alert.alert(translate(resolvedLocale, 'verification.verified'), info.success, [
            { text: translate(resolvedLocale, 'common.ok'), onPress: onSuccess },
          ]);
        })();
      },
    },
  ]);
}
