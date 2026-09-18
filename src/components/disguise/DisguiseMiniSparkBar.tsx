import { Ionicons } from '@expo/vector-icons';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';

import { useTranslation } from '../../i18n';
import { pulseBrand } from '../../theme/pulseBrand';
import { spacing } from '../../theme';
import { ScalePressable } from '../motion/ScalePressable';

type DisguiseMiniSparkBarProps = {
  liked: boolean;
  superLiked: boolean;
  passed: boolean;
  disabled?: boolean;
  onLike: () => void;
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
  disabled?: boolean;
  size?: number;
  iconSize?: number;
  onPress: () => void;
  accessibilityLabel: string;
};

function stopMiniActionPropagation(event?: GestureResponderEvent) {
  event?.stopPropagation?.();
}

/** Same Ionicons as Spark discover — pass / super like / like — in Pulse blue. */
function MiniIconButton({
  icon,
  active,
  disabled = false,
  size = BUTTON_SIZE,
  iconSize = ICON_SIZE,
  onPress,
  accessibilityLabel,
}: MiniIconButtonProps) {
  const accent = pulseBrand.accent;

  return (
    <ScalePressable
      onPress={(event) => {
        if (disabled) {
          return;
        }
        stopMiniActionPropagation(event);
        onPress();
      }}
      active={false}
      accessibilityLabel={accessibilityLabel}
      scaleTo={disabled ? 1 : 0.86}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? accent : pulseBrand.accentSoft,
          borderColor: active ? accent : pulseBrand.accentBorder,
          opacity: disabled ? 0.55 : 1,
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
  disabled = false,
  onLike,
  onSuperLike,
  onPass,
}: DisguiseMiniSparkBarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.bar} pointerEvents="box-none">
      <View style={[styles.slot, { width: BUTTON_SIZE, height: BUTTON_SIZE }]}>
        <MiniIconButton
          icon="trash-outline"
          active={passed}
          disabled={disabled}
          onPress={onPass}
          accessibilityLabel={t('disguiseMiniWindow.passA11y')}
        />
      </View>
      <View style={[styles.slot, { width: STAR_SIZE, height: STAR_SIZE }]}>
        <MiniIconButton
          icon="star"
          active={superLiked}
          disabled={disabled}
          size={STAR_SIZE}
          iconSize={STAR_ICON_SIZE}
          onPress={onSuperLike}
          accessibilityLabel={t('disguiseMiniWindow.superLikeA11y')}
        />
      </View>
      <View style={[styles.slot, { width: BUTTON_SIZE, height: BUTTON_SIZE }]}>
        <MiniIconButton
          icon="heart"
          active={liked}
          disabled={disabled}
          onPress={onLike}
          accessibilityLabel={t('disguiseMiniWindow.likeA11y')}
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
    zIndex: 6,
    position: 'relative',
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 6,
  },
});
