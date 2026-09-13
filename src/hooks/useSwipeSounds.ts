import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';

type SwipeSoundKind = 'like' | 'pass';

const soundSources: Record<SwipeSoundKind, number> = {
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
      let sound = soundsRef.current[kind];
      if (!sound) {
        const created = await Audio.Sound.createAsync(soundSources[kind], {
          volume: kind === 'like' ? 0.9 : 0.75,
        });
        sound = created.sound;
        soundsRef.current[kind] = sound;
      }

      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Sound is optional; browser may block until first user gesture.
    }
  }, []);

  return { playSound };
};
