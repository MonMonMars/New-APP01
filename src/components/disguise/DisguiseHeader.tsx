import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { spacing } from '../../theme';
import { ModeToggleLogo } from './ModeToggleLogo';
import { PulseBrand } from './PulseBrandMark';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseHeaderProps = {
  title?: string;
  showSearch?: boolean;
};

export function DisguiseHeader({ title, showSearch = true }: DisguiseHeaderProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<DisguiseTabParamList>>();

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={styles.leading}>
        <ModeToggleLogo variant="pulse" />
        <View style={styles.brandBlock}>
          <PulseBrand size="sm" />
          {title ? (
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        {showSearch && (
          <>
            <AnimatedPressable
              style={styles.iconBtn}
              accessibilityLabel="Search trending topics"
              onPress={() => navigation.navigate('Trending')}
            >
              <Ionicons name="search-outline" size={22} color={colors.text} />
            </AnimatedPressable>
            <AnimatedPressable
              style={styles.iconBtn}
              accessibilityLabel="Open activity"
              onPress={() => navigation.navigate('Activity')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </AnimatedPressable>
          </>
        )}
      </View>
    </View>
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
  },
  brandBlock: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.xs,
  },
});
