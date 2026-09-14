import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';

type SwipeSoundKind = 'like' | 'pass' | 'super';

const soundSources: Record<'like' | 'pass', number> = {
  like: require('../../assets/sounds/like.mp3'),
  pass: require('../../assets/sounds/pass.mp3'),
};

export function useSwipeSounds() {
  const soundsRef = useRef<Partial<Record<SwipeSoundKind, Audio.Sound>>>({});

  useEffect(() => {
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    return () => {
      const sounds = soundsRef.current;
      void Promise.all(
        Object.values(sounds).map((sound) => sound?.unloadAsync() ?? Promise.resolve()),
      );
      soundsRef.current = {};
    };
  }, []);

  const playSound = useCallback(async (kind: SwipeSoundKind) => {
    try {
      const sourceKind = kind === 'super' ? 'like' : kind;
      let sound = soundsRef.current[sourceKind];
      if (!sound) {
        const created = await Audio.Sound.createAsync(soundSources[sourceKind], {
          volume: kind === 'pass' ? 0.75 : 0.9,
        });
        sound = created.sound;
        soundsRef.current[sourceKind] = sound;
      }

      await sound.setPositionAsync(0);
      if (kind === 'super') {
        await sound.setRateAsync(1.45, true);
      } else {
        await sound.setRateAsync(1, true);
      }
      await sound.playAsync();
    } catch {
      // Sound is optional; browser may block until first user gesture.
    }
  }, []);

  return { playSound };
};
