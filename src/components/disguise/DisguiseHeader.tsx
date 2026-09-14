import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { spacing } from '../../theme';

type DisguiseHeaderProps = {
  title?: string;
  showSearch?: boolean;
};

const UNLOCK_HOLD_MS = 1200;

/** Long-press the Pulse logo to unlock Spark (secret gesture). */
export function DisguiseHeader({ title, showSearch = true }: DisguiseHeaderProps) {
  const { colors } = useTheme();
  const { setDisguiseMode } = useApp();
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = () => {
    holdTimer.current = setTimeout(() => {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setDisguiseMode(false);
    }, UNLOCK_HOLD_MS);
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <Pressable
        onPressIn={startHold}
        onPressOut={cancelHold}
        style={styles.logoRow}
        accessibilityLabel={`${DISGUISE_APP_NAME} home`}
      >
        <View style={styles.logoIcon}>
          <Ionicons name="pulse" size={20} color="#3b82f6" />
        </View>
        <Text style={[styles.logoText, { color: colors.text }]}>
          {title ?? DISGUISE_APP_NAME}
        </Text>
      </Pressable>
      {showSearch && (
        <View style={styles.actions}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      )}
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.xs,
  },
});
