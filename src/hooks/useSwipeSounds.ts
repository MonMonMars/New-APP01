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
      const existing = soundsRef.current[kind];
      if (existing) {
        await existing.replayAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundSources[kind], {
        shouldPlay: true,
        volume: kind === 'like' ? 0.9 : 0.75,
      });
      soundsRef.current[kind] = sound;
    } catch {
      // Sound is optional feedback; ignore playback failures on web/autoplay blocks.
    }
  }, []);

  return { playSound };
}
