import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { ensureWebMotionCss, webClass } from '../../motion/webMotion';
import { spacing } from '../../theme';

type PulseFeedRefreshGreyBlocksProps = {
  visible: boolean;
};

/** Instagram / YouTube style placeholder rails while Pulse reloads at the top. */
export function PulseFeedRefreshGreyBlocks({ visible }: PulseFeedRefreshGreyBlocksProps) {
  useEffect(() => {
    if (visible) {
      ensureWebMotionCss();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.host}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID="pulse-feed-refresh-grey-blocks"
    >
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.row}>
          <View
            style={[styles.avatar, row === 0 ? styles.avatarLarge : null]}
            {...(Platform.OS === 'web' ? webClass('spark-pulse-grey-block') : {})}
          />
          <View style={styles.column}>
            <View
              style={[styles.line, styles.lineTitle, { width: row === 0 ? '72%' : '58%' }]}
              {...(Platform.OS === 'web' ? webClass('spark-pulse-grey-block') : {})}
            />
            <View
              style={[styles.line, styles.lineBody, { width: row === 0 ? '92%' : '84%' }]}
              {...(Platform.OS === 'web' ? webClass('spark-pulse-grey-block') : {})}
            />
            {row === 0 ? (
              <View
                style={[styles.media, styles.mediaHero]}
                {...(Platform.OS === 'web' ? webClass('spark-pulse-grey-block') : {})}
              />
            ) : (
              <View
                style={[styles.line, styles.lineBody, { width: '64%' }]}
                {...(Platform.OS === 'web' ? webClass('spark-pulse-grey-block') : {})}
              />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const GREY = Platform.select({
  web: '#d8d8de',
  default: '#d0d0d8',
});

const styles = StyleSheet.create({
  host: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREY,
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  column: {
    flex: 1,
    gap: spacing.xs,
  },
  line: {
    height: 10,
    borderRadius: 5,
    backgroundColor: GREY,
  },
  lineTitle: {
    height: 12,
  },
  lineBody: {
    opacity: 0.92,
  },
  media: {
    marginTop: spacing.xs,
    borderRadius: 12,
    backgroundColor: GREY,
  },
  mediaHero: {
    height: 132,
    width: '100%',
  },
});
