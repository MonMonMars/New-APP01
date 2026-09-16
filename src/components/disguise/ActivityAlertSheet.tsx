import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseAlert } from '../../data/disguiseFeed';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { FeedPersonRow } from './FeedPersonRow';
import { AnimatedPressable } from '../AnimatedPressable';

type ActivityAlertSheetProps = {
  visible: boolean;
  alert: DisguiseAlert | null;
  onClose: () => void;
};

export function ActivityAlertSheet({ visible, alert, onClose }: ActivityAlertSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (!alert) {
    return null;
  }

  const isSponsored = alert.icon === 'megaphone-outline';

  return (
    <AnimatedOverlay visible={visible} onClose={onClose} variant="bottom">
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <FadeSlideIn replayKey={visible} index={0}>
          <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
            <Text style={[styles.badge, { color: colors.textMuted }]}>
              {isSponsored ? 'Sponsored' : 'Activity'}
            </Text>
            <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close" scaleTo={0.9}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </AnimatedPressable>
          </View>
        </FadeSlideIn>

        <View style={styles.body}>
          <FadeSlideIn replayKey={visible} index={1}>
            {alert.person ? (
              <FeedPersonRow
                imageUrl={alert.person.avatarUrl}
                overlayText={alert.person.overlayText ?? 'LIVE'}
                overlayVariant={alert.person.overlayVariant ?? 'news'}
                plainAvatar={!alert.person.overlayVariant}
                contentKind="profile"
                title={alert.person.name}
                body={alert.text}
                titleStyle={{ color: colors.text }}
                bodyStyle={{ color: colors.textMuted, lineHeight: 20 }}
              />
            ) : (
              <>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                  <Ionicons name={alert.icon} size={22} color="#3b82f6" />
                </View>
                <Text style={[styles.text, { color: colors.text }]}>{alert.text}</Text>
              </>
            )}
          </FadeSlideIn>
          <FadeSlideIn replayKey={visible} index={2}>
            <Text style={[styles.time, { color: colors.textMuted }]}>{alert.time}</Text>
          </FadeSlideIn>
          <FadeSlideIn replayKey={visible} index={3}>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {isSponsored
                ? 'Offers in Pulse are sponsored placements — tap through only if you recognise the brand.'
                : 'Notifications from your Pulse feed. Dating actions stay private in Spark.'}
            </Text>
          </FadeSlideIn>
        </View>
      </View>
    </AnimatedOverlay>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '70%',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
});
