import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { DisguiseWorld } from '../../utils/disguiseWorld';
import { spacing } from '../../theme';
import { SparkIconButton, type SparkIconShape } from '../motion/ScalePressable';

type DisguiseMiniSparkBarProps = {
  liked: boolean;
  superLiked: boolean;
  passed: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onSuperLike: () => void;
  onPass: () => void;
  world?: DisguiseWorld;
};

function chromeForWorld(world: DisguiseWorld): {
  pass: 'close-outline';
  superLike: 'flash' | 'trending-up';
  like: 'thumbs-up' | 'bookmark';
  likeOutline: 'thumbs-up-outline' | 'bookmark-outline';
  passShape: SparkIconShape;
  superShape: SparkIconShape;
  likeShape: SparkIconShape;
} {
  switch (world) {
    case 'harbor':
      return {
        pass: 'close-outline',
        superLike: 'trending-up',
        like: 'bookmark',
        likeOutline: 'bookmark-outline',
        passShape: 'squircle',
        superShape: 'hex',
        likeShape: 'pill',
      };
    case 'pulse':
      return {
        pass: 'close-outline',
        superLike: 'flash',
        like: 'thumbs-up',
        likeOutline: 'thumbs-up-outline',
        passShape: 'hex',
        superShape: 'diamond',
        likeShape: 'pill',
      };
    default: {
      const _exhaustive: never = world;
      return _exhaustive;
    }
  }
}

/** Compact pass / featured / save row. Featured sits in the middle. No hearts in Pulse. */
export function DisguiseMiniSparkBar({
  liked,
  superLiked,
  passed,
  onLike,
  onUnlike,
  onSuperLike,
  onPass,
  world = 'pulse',
}: DisguiseMiniSparkBarProps) {
  const { colors } = useTheme();
  const chrome = chromeForWorld(world);
  const likeColor = world === 'harbor' ? colors.ember : colors.gradientEnd;

  return (
    <View style={styles.bar}>
      <View style={styles.slot}>
        <SparkIconButton
          icon={chrome.pass}
          iconSize={13}
          color={passed ? colors.nope : colors.textMuted}
          active={passed}
          activeBackground={`${colors.nope}2e`}
          activeBorder={colors.nope}
          idleBackground="rgba(128,128,128,0.08)"
          idleBorder="rgba(128,128,128,0.35)"
          onPress={onPass}
          accessibilityLabel="Pass profile"
          size={30}
          shape={chrome.passShape}
        />
      </View>

      <View style={styles.centerSlot}>
        <SparkIconButton
          icon={chrome.superLike}
          iconSize={14}
          color={superLiked ? '#fff' : colors.superLike}
          active={superLiked}
          activeBackground={colors.superLike}
          activeBorder={colors.superLike}
          idleBackground={`${colors.superLike}1f`}
          idleBorder={`${colors.superLike}8c`}
          onPress={onSuperLike}
          accessibilityLabel="Super like profile"
          size={36}
          shape={chrome.superShape}
        />
      </View>

      <View style={styles.slot}>
        <SparkIconButton
          icon={liked ? chrome.like : chrome.likeOutline}
          iconSize={13}
          color={liked ? '#fff' : likeColor}
          active={liked}
          activeBackground={likeColor}
          activeBorder={likeColor}
          idleBackground={`${likeColor}14`}
          idleBorder={`${likeColor}73`}
          onPress={liked ? onUnlike : onLike}
          accessibilityLabel={liked ? 'Unlike profile' : 'Like profile'}
          size={30}
          shape={chrome.likeShape}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    paddingHorizontal: spacing.xs,
    zIndex: 4,
  },
  slot: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
