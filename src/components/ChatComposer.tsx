import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ChatComposerProps = {
  draft: string;
  onChangeDraft: (text: string) => void;
  onSend: (text: string) => void;
  onPickImage: () => void;
  onSuggestDate: () => void;
  onVibeGame: () => void;
  paddingBottom: number;
};

type ExtraAction = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function triggerHaptic() {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
  const [extrasOpen, setExtrasOpen] = useState(false);
  const extrasProgress = useSharedValue(0);

  const hasText = draft.trim().length > 0;

  const extrasStyle = useAnimatedStyle(() => ({
    opacity: extrasProgress.value,
    maxHeight: extrasProgress.value * 72,
    marginBottom: extrasProgress.value * spacing.sm,
  }));

  const toggleExtras = () => {
    triggerHaptic();
    const next = !extrasOpen;
    setExtrasOpen(next);
    extrasProgress.value = withSpring(next ? 1 : 0, { damping: 16, stiffness: 280 });
  };

  const runExtra = (action: () => void) => {
    triggerHaptic();
    action();
    setExtrasOpen(false);
    extrasProgress.value = withTiming(0, { duration: 180 });
  };

  const handleSend = () => {
    if (!hasText) {
      return;
    }
    triggerHaptic();
    onSend(draft);
  };

  const extras: ExtraAction[] = [
    { id: 'photo', icon: 'images-outline', label: 'Photo', onPress: onPickImage },
    { id: 'date', icon: 'calendar-outline', label: 'Date', onPress: onSuggestDate },
    { id: 'vibe', icon: 'color-wand-outline', label: 'Vibe', onPress: onVibeGame },
    {
      id: 'voice',
      icon: 'mic-outline',
      label: 'Voice',
      onPress: () => onSend('🎤 Voice note: Hey!'),
    },
  ];

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border, paddingBottom }]}>
      <Animated.View style={[styles.extrasTray, extrasStyle]} pointerEvents={extrasOpen ? 'auto' : 'none'}>
        <View style={styles.extrasRow}>
          {extras.map((item) => (
            <AnimatedPressable
              key={item.id}
              scaleTo={0.92}
              style={[styles.extraButton, { backgroundColor: colors.surface }]}
              onPress={() => runExtra(item.onPress)}
              accessibilityLabel={item.label}
            >
              <Ionicons name={item.icon} size={22} color={colors.gradientEnd} />
              <Text style={[styles.extraLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </AnimatedPressable>
          ))}
        </View>
      </Animated.View>

      <View style={styles.composer}>
        <AnimatedPressable
          scaleTo={0.9}
          onPress={toggleExtras}
          style={[
            styles.plusButton,
            {
              backgroundColor: extrasOpen ? colors.gradientEnd : colors.surface,
            },
          ]}
          accessibilityLabel={extrasOpen ? 'Hide extras' : 'More actions'}
        >
          <Ionicons
            name={extrasOpen ? 'close' : 'add'}
            size={22}
            color={extrasOpen ? colors.text : colors.textMuted}
          />
        </AnimatedPressable>

        <TextInput
          value={draft}
          onChangeText={onChangeDraft}
          placeholder="Message..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <AnimatedPressable
          scaleTo={0.9}
          onPress={handleSend}
          disabled={!hasText}
          style={[
            styles.sendButton,
            { backgroundColor: hasText ? colors.gradientEnd : colors.surface },
          ]}
          accessibilityLabel="Send message"
        >
          <Ionicons
            name="send"
            size={18}
            color={hasText ? colors.text : colors.textMuted}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  extrasTray: {
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  extrasRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  extraButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    gap: 4,
  },
  extraLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
