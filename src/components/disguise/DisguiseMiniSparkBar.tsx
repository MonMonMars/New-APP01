import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { spacing } from '../../theme';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { ScalePressable } from '../motion/ScalePressable';

type DisguiseMiniSparkBarProps = {
  liked: boolean;
  superLiked: boolean;
  passed: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onSuperLike: () => void;
  onPass: () => void;
};

const BUTTON_SIZE = 22;
const LETTER_SIZE = 10;

type MiniLetterButtonProps = {
  letter: 'X' | 'S' | 'L';
  active: boolean;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  onPress: () => void;
  accessibilityLabel: string;
};

function MiniLetterButton({
  letter,
  active,
  accent,
  accentSoft,
  accentBorder,
  onPress,
  accessibilityLabel,
}: MiniLetterButtonProps) {
  return (
    <ScalePressable
      onPress={onPress}
      active={false}
      accessibilityLabel={accessibilityLabel}
      scaleTo={0.86}
      style={[
        styles.button,
        {
          backgroundColor: active ? accent : accentSoft,
          borderColor: active ? accent : accentBorder,
        },
      ]}
    >
      <Text style={[styles.letter, { color: active ? '#fff' : accent }]}>{letter}</Text>
    </ScalePressable>
  );
}

/** Compact X / S / L row. Same-size circles in the active disguise accent. Super like stays in the middle. */
export function DisguiseMiniSparkBar({
  liked,
  superLiked,
  passed,
  onLike,
  onUnlike,
  onSuperLike,
  onPass,
}: DisguiseMiniSparkBarProps) {
  const { preferences } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);

  return (
    <View style={styles.bar}>
      <View style={styles.slot}>
        <MiniLetterButton
          letter="X"
          active={passed}
          accent={meta.accent}
          accentSoft={meta.accentSoft}
          accentBorder={meta.accentBorder}
          onPress={onPass}
          accessibilityLabel="Pass profile"
        />
      </View>
      <View style={styles.slot}>
        <MiniLetterButton
          letter="S"
          active={superLiked}
          accent={meta.accent}
          accentSoft={meta.accentSoft}
          accentBorder={meta.accentBorder}
          onPress={onSuperLike}
          accessibilityLabel="Super like profile"
        />
      </View>
      <View style={styles.slot}>
        <MiniLetterButton
          letter="L"
          active={liked}
          accent={meta.accent}
          accentSoft={meta.accentSoft}
          accentBorder={meta.accentBorder}
          onPress={liked ? onUnlike : onLike}
          accessibilityLabel={liked ? 'Unlike profile' : 'Like profile'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: spacing.md,
    zIndex: 4,
  },
  slot: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  letter: {
    fontSize: LETTER_SIZE,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: LETTER_SIZE + 1,
  },
});
