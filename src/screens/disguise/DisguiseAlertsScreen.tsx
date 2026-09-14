import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { useTheme } from '../../context/ThemeContext';
import { disguiseAlerts } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';

export function DisguiseAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title="Activity" showSearch={false} />
      <FlatList
        data={disguiseAlerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const externalUrl = item.articleUrl ?? item.landingUrl;
          const handlePress = externalUrl
            ? () => {
                void openExternalUrl(externalUrl, item.text);
              }
            : undefined;

          return (
          <Pressable
            accessibilityRole={externalUrl ? 'link' : 'button'}
            onPress={handlePress}
            style={[styles.row, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
              <Ionicons name={item.icon} size={20} color="#3b82f6" />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.text, { color: colors.text }]}>{item.text}</Text>
              <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
            </View>
          </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    marginTop: 4,
  },
});
