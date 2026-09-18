import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

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

const BUTTON_SIZE = 36;
const STAR_SIZE = 32;
const ICON_SIZE = 18;
const STAR_ICON_SIZE = 16;

type MiniIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  size?: number;
  iconSize?: number;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Same Ionicons as Spark discover — pass / super like / like — in Pulse blue. */
function MiniIconButton({
  icon,
  active,
  size = BUTTON_SIZE,
  iconSize = ICON_SIZE,
  onPress,
  accessibilityLabel,
}: MiniIconButtonProps) {
  const accent = pulseBrand.accent;

  return (
    <ScalePressable
      onPress={onPress}
      active={false}
      accessibilityLabel={accessibilityLabel}
      scaleTo={0.86}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? accent : pulseBrand.accentSoft,
          borderColor: active ? accent : pulseBrand.accentBorder,
        },
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={active ? '#fff' : accent} />
    </ScalePressable>
  );
}

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
      <View style={[styles.slot, { width: BUTTON_SIZE, height: BUTTON_SIZE }]}>
        <MiniIconButton
          icon="trash-outline"
          active={passed}
          onPress={onPass}
          accessibilityLabel="Pass profile"
        />
      </View>
      <View style={[styles.slot, { width: STAR_SIZE, height: STAR_SIZE }]}>
        <MiniIconButton
          icon="star"
          active={superLiked}
          size={STAR_SIZE}
          iconSize={STAR_ICON_SIZE}
          onPress={onSuperLike}
          accessibilityLabel="Super like profile"
        />
      </View>
      <View style={[styles.slot, { width: BUTTON_SIZE, height: BUTTON_SIZE }]}>
        <MiniIconButton
          icon="heart"
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
