import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { spacing } from '../../theme';
import { ModeToggleLogo } from './ModeToggleLogo';
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
      <ModeToggleLogo variant="pulse" />
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
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.xs,
  },
});
