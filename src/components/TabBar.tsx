import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

type TabKey = 'discover' | 'explore' | 'likes' | 'chat' | 'profile';

type TabBarProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'discover', label: 'Discover', icon: 'flame' },
  { key: 'explore', label: 'Explore', icon: 'compass' },
  { key: 'likes', label: 'Likes', icon: 'heart' },
  { key: 'chat', label: 'Chat', icon: 'chatbubble' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const color = isActive ? colors.gradientEnd : colors.textMuted;

        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
          >
            <Ionicons name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A2A2E',
    backgroundColor: colors.background,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
