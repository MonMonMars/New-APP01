import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { spacing } from '../../theme';
import { PulseFeedRefreshGreyBlocks } from './PulseFeedRefreshGreyBlocks';

type PulseFeedRefreshTopChromeProps = {
  visible: boolean;
  pullOffset?: number;
};

/**
 * Fixed reload rail — stays on screen while refreshing (scroll-to-top, pull, tab re-tap).
 * Matches Instagram / YouTube home refresh placeholders.
 */
export function PulseFeedRefreshTopChrome({ visible, pullOffset = 0 }: PulseFeedRefreshTopChromeProps) {
  const accent = useDisguiseWorld().accent;
  const pullActive = pullOffset > 12;

  if (!visible && !pullActive) {
    return null;
  }

  const pullProgress = Math.min(1, pullOffset / 72);

  return (
    <View
      style={[styles.host, pullActive && !visible ? styles.hostPull : null]}
      pointerEvents="none"
      testID="pulse-feed-refresh-top-chrome"
    >
      <View style={styles.spinnerRow}>
        <ActivityIndicator
          color={accent}
          size="small"
          animating
          style={{ opacity: visible ? 1 : 0.35 + pullProgress * 0.65 }}
        />
      </View>
      {visible ? <PulseFeedRefreshGreyBlocks visible /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: Platform.OS === 'web' ? 'rgba(242, 242, 246, 0.96)' : 'rgba(238, 238, 244, 0.97)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(160, 160, 168, 0.35)',
  },
  hostPull: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(242, 242, 246, 0.88)' : 'rgba(238, 238, 244, 0.9)',
  },
  spinnerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    marginBottom: spacing.xs,
  },
});
