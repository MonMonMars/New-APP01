import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

export type VoiceEmotion = {
  id: string;
  emoji: string;
  label: string;
};

export const VOICE_EMOTIONS: VoiceEmotion[] = [
  { id: 'cheerful', emoji: '😊', label: 'Cheerful' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'warm', emoji: '🥰', label: 'Warm' },
  { id: 'playful', emoji: '😄', label: 'Playful' },
  { id: 'curious', emoji: '🤔', label: 'Curious' },
  { id: 'bold', emoji: '💪', label: 'Bold' },
];

type ChatComposerProps = {
  draft: string;
  onChangeDraft: (text: string) => void;
  onSend: (text: string) => void;
  onPickImage: () => void;
  onSuggestDate: () => void;
  onVibeGame: () => void;
  paddingBottom: number;
};

function triggerHaptic(style: 'light' | 'medium' = 'light') {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.impactAsync(
    style === 'light' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
  );
}

export function ChatComposer({
  draft,
  onChangeDraft,
  onSend,
  onPickImage,
  onSuggestDate,
  onVibeGame,
  paddingBottom,
}: ChatComposerProps) {
  const { colors } = useTheme();
  const [selectedEmotion, setSelectedEmotion] = useState<VoiceEmotion>(VOICE_EMOTIONS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef(false);
  const micPulse = useSharedValue(1);
  const micRing = useSharedValue(0.35);
  const recordScale = useSharedValue(1);

  const hasText = draft.trim().length > 0;

  useEffect(() => {
    if (isRecording) {
      micPulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 420, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      micRing.value = withRepeat(
        withSequence(
          withTiming(0.75, { duration: 700 }),
          withTiming(0.25, { duration: 700 }),
        ),
        -1,
        false,
      );
      return;
    }

    micPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    micRing.value = withTiming(0.35, { duration: 200 });
  }, [isRecording, micPulse, micRing]);

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micPulse.value * recordScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: micRing.value,
    transform: [{ scale: 1 + micRing.value * 0.35 }],
  }));

  const handleMicPressIn = () => {
    triggerHaptic('medium');
    recordingRef.current = true;
    recordScale.value = withSpring(1.06, { damping: 12, stiffness: 380 });
    setIsRecording(true);
  };

  const handleMicPressOut = () => {
    recordScale.value = withSpring(1, { damping: 14, stiffness: 420 });
    if (recordingRef.current) {
      const message = `🎤 (${selectedEmotion.label} voice) Hey — just wanted to say hi!`;
      onSend(message);
    }
    recordingRef.current = false;
    setIsRecording(false);
  };

  const handleSend = () => {
    if (!hasText) {
      return;
    }
    triggerHaptic('light');
    onSend(draft);
  };

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border, paddingBottom }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emotionRow}
      >
        {VOICE_EMOTIONS.map((emotion) => {
          const active = emotion.id === selectedEmotion.id;
          return (
            <AnimatedPressable
              key={emotion.id}
              scaleTo={0.92}
              onPress={() => {
                triggerHaptic('light');
                setSelectedEmotion(emotion);
              }}
              style={[
                styles.emotionChip,
                {
                  backgroundColor: active ? `${colors.gradientEnd}22` : colors.surface,
                  borderColor: active ? colors.gradientEnd : colors.border,
                },
              ]}
              accessibilityLabel={`${emotion.label} voice tone`}
            >
              <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
              <Text style={[styles.emotionLabel, { color: active ? colors.gradientEnd : colors.textMuted }]}>
                {emotion.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>

      <View style={styles.composer}>
        <AnimatedPressable
          scaleTo={0.88}
          onPress={onSuggestDate}
          style={styles.sideAction}
          accessibilityLabel="Suggest a date"
        >
          <Ionicons name="calendar-outline" size={22} color={colors.textMuted} />
        </AnimatedPressable>

        <AnimatedPressable
          scaleTo={0.88}
          onPress={onVibeGame}
          style={styles.sideAction}
          accessibilityLabel="Read my vibe game"
        >
          <Ionicons name="color-wand-outline" size={22} color={colors.textMuted} />
        </AnimatedPressable>

        <AnimatedPressable
          scaleTo={0.88}
          onPress={onPickImage}
          style={styles.sideAction}
          accessibilityLabel="Send a photo"
        >
          <Ionicons name="images-outline" size={22} color={colors.textMuted} />
        </AnimatedPressable>

        <TextInput
          value={draft}
          onChangeText={onChangeDraft}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          onSubmitEditing={handleSend}
        />

        {hasText ? (
          <AnimatedPressable
            scaleTo={0.9}
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: colors.gradientEnd }]}
            accessibilityLabel="Send message"
          >
            <Ionicons name="send" size={20} color={colors.text} />
          </AnimatedPressable>
        ) : (
          <View style={styles.micWrap}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.micRing,
                { borderColor: isRecording ? colors.nope : colors.gradientEnd },
                ringStyle,
              ]}
            />
            <Pressable
              onPressIn={handleMicPressIn}
              onPressOut={handleMicPressOut}
              accessibilityLabel="Hold to send voice note"
              accessibilityHint={`Uses ${selectedEmotion.label} tone`}
            >
              <Animated.View
                style={[
                  styles.micButton,
                  {
                    backgroundColor: isRecording ? colors.nope : colors.gradientEnd,
                  },
                  micStyle,
                ]}
              >
                <Text style={styles.micEmoji}>{selectedEmotion.emoji}</Text>
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={26} color={colors.text} />
              </Animated.View>
            </Pressable>
          </View>
        )}
      </View>

      {!hasText && (
        <Text style={[styles.micHint, { color: colors.textMuted }]}>
          {isRecording ? 'Release to send voice note' : 'Hold mic · pick an emotion above'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emotionRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.button,
    borderWidth: 1,
  },
  emotionEmoji: {
    fontSize: 18,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  sideAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    minHeight: 40,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  micEmoji: {
    fontSize: 13,
    lineHeight: 15,
    marginBottom: -2,
  },
  micHint: {
    textAlign: 'center',
    fontSize: 11,
    paddingBottom: spacing.xs,
    paddingTop: 2,
  },
});
