import { Alert } from 'react-native';

import { pickProfilePhoto } from './photoPicker';

type VerificationKind = 'photo' | 'person' | 'age';

const copy: Record<
  VerificationKind,
  { title: string; body: string; action: string; success: string }
> = {
  photo: {
    title: 'Photo verification',
    body: 'Take a live selfie. We compare it to your profile photos to confirm they are you.',
    action: 'Take selfie',
    success: 'Photo verified — your selfie matches your profile.',
  },
  person: {
    title: 'Real person check',
    body: 'Complete a short liveness scan (blink, turn your head). This confirms you are a real human.',
    action: 'Start scan',
    success: 'Real person check passed.',
  },
  age: {
    title: 'Age verification',
    body: 'Submit a government ID through a secure flow to confirm you are 18+.',
    action: 'Continue',
    success: 'Age verified — you are confirmed as 18+.',
  },
};

export function runVerificationFlow(
  kind: VerificationKind,
  onSuccess: () => void,
  onOpenPolicy?: () => void,
): void {
  const info = copy[kind];
  Alert.alert(info.title, info.body, [
    { text: 'Cancel', style: 'cancel' },
    ...(onOpenPolicy ? [{ text: 'Read policy', onPress: onOpenPolicy }] : []),
    {
      text: info.action,
      onPress: () => {
        void (async () => {
          if (kind === 'photo' || kind === 'person') {
            const uri = await pickProfilePhoto();
            if (!uri) {
              return;
            }
          }
          Alert.alert('Verified', info.success, [{ text: 'OK', onPress: onSuccess }]);
        })();
      },
    },
  ]);
}
