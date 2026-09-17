import { StyleSheet, Text, View } from 'react-native';

import { pulseBrand } from '../../theme/pulseBrand';
import { spacing } from '../../theme';
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
const PULSE_BLUE = pulseBrand.accent;

type MiniLetterButtonProps = {
  letter: 'X' | 'S' | 'L';
  active: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

function MiniLetterButton({ letter, active, onPress, accessibilityLabel }: MiniLetterButtonProps) {
  return (
    <ScalePressable
      onPress={onPress}
      active={active}
      accessibilityLabel={accessibilityLabel}
      scaleTo={0.86}
      style={[
        styles.button,
        {
          backgroundColor: active ? PULSE_BLUE : pulseBrand.accentSoft,
          borderColor: active ? PULSE_BLUE : pulseBrand.accentBorder,
        },
      ]}
    >
      <Text style={[styles.letter, { color: active ? '#fff' : PULSE_BLUE }]}>{letter}</Text>
    </ScalePressable>
  );
}

/** Compact X / S / L row. Same-size Pulse-blue circles. Super like stays in the middle. */
export function DisguiseMiniSparkBar({
  liked,
  superLiked,
  passed,
  onLike,
  onUnlike,
  onSuperLike,
  onPass,
}: DisguiseMiniSparkBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.slot}>
        <MiniLetterButton
          letter="X"
          active={passed}
          onPress={onPass}
          accessibilityLabel="Pass profile"
        />
      </View>
      <View style={styles.slot}>
        <MiniLetterButton
          letter="S"
          active={superLiked}
          onPress={onSuperLike}
          accessibilityLabel="Super like profile"
        />
      </View>
      <View style={styles.slot}>
        <MiniLetterButton
          letter="L"
          active={liked}
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
