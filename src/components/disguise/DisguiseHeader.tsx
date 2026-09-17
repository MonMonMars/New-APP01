import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { FeedItem } from '../../data/disguiseFeed';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { spacing } from '../../theme';
import { navigateDisguiseFeedTopic } from '../../utils/disguiseNavigation';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { DisguiseSearchSheet } from './DisguiseSearchSheet';
import { DisguiseBrandMark } from './DisguiseBrand';
import { PulseFeedItemViewer } from './PulseFeedItemViewer';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseHeaderProps = {
  title?: string;
  showSearch?: boolean;
};

export function DisguiseHeader({ title, showSearch = true }: DisguiseHeaderProps) {
  const { colors } = useTheme();
  const { user, preferences, setDisguiseMode } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection, user.gender);
  const navigation = useNavigation<BottomTabNavigationProp<DisguiseTabParamList>>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchItemId, setSearchItemId] = useState<string | null>(null);

  const handleSearchArticle = (item: FeedItem) => {
    setSearchItemId(item.id);
  };

  return (
    <>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.leading}>
          <AnimatedPressable
            onPress={() => {
              setDisguiseMode(false);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Tap ${meta.name} logo to leave ${meta.unlockLabel}`}
            accessibilityHint={`Leaves ${meta.name} and opens ${meta.unlockLabel}`}
            scaleTo={0.96}
            hitSlop={8}
            style={styles.brandTap}
          >
            <DisguiseBrandMark size="sm" muted />
          </AnimatedPressable>
          {title ? (
            <View style={styles.titleBlock}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]} numberOfLines={1}>
                {title}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          {showSearch && (
            <>
              <AnimatedPressable
                style={styles.iconBtn}
                accessibilityLabel={meta.searchTitle}
                onPress={() => setSearchOpen(true)}
              >
                <Ionicons name="search-outline" size={22} color={meta.accent} />
              </AnimatedPressable>
              <AnimatedPressable
                style={styles.iconBtn}
                accessibilityLabel="Open activity"
                onPress={() => navigation.navigate('Activity')}
              >
                <Ionicons name="notifications-outline" size={22} color={meta.accent} />
              </AnimatedPressable>
            </>
          )}
        </View>
      </View>

      <DisguiseSearchSheet
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTopic={(topic) => navigateDisguiseFeedTopic(navigation, topic)}
        onSelectArticle={handleSearchArticle}
      />
      <PulseFeedItemViewer
        itemId={searchItemId}
        onClose={() => setSearchItemId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  brandTap: {
    flexShrink: 0,
    zIndex: 2,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexShrink: 0,
  },
  iconBtn: {
    padding: spacing.xs,
  },
});
