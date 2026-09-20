import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { getPassportCityLabel } from '../i18n/labels';
import { DiscoveryPreferences, PASSPORT_CITIES } from '../types/preferences';
import { regionalAuthMethodsDescriptionKey } from '../config/regionalAuthProviders';
import type { AccountRegionContext } from '../types/accountRegion';
import { withHomePassportCity } from '../utils/accountRegion';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type AccountHomeMarketSheetProps = {
  visible: boolean;
  preferences: DiscoveryPreferences;
  accountCountryCode: string;
  accountRegion: AccountRegionContext;
  onClose: () => void;
  onSave: (preferences: DiscoveryPreferences) => void;
};

export function AccountHomeMarketSheet({
  visible,
  preferences,
  accountCountryCode,
  accountRegion,
  onClose,
  onSave,
}: AccountHomeMarketSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const homeCity = preferences.homePassportCity ?? preferences.passportCity;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top + spacing.md },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('profile.accountHomeMarketTitle')}</Text>
          <AnimatedPressable onPress={onClose}>
            <Text style={[styles.done, { color: colors.gradientEnd }]}>{t('common.done')}</Text>
          </AnimatedPressable>
        </View>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('profile.accountHomeMarketHint')}</Text>
        <Text style={[styles.current, { color: colors.text }]}>
          {t('profile.accountHomeMarketCurrent', { code: accountCountryCode })}
        </Text>
        <Text style={[styles.methods, { color: colors.textMuted }]}>
          {t(regionalAuthMethodsDescriptionKey(accountRegion))}
        </Text>
        <ScrollView contentContainerStyle={styles.grid}>
          {PASSPORT_CITIES.map((city) => {
            const selected = homeCity === city;
            return (
              <AnimatedPressable
                key={city}
                style={[
                  styles.cityChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selected && { borderColor: colors.gradientEnd },
                ]}
                onPress={() => {
                  onSave(withHomePassportCity(preferences, city));
                  onClose();
                }}
              >
                {selected ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.gradientEnd} />
                ) : null}
                <Text style={[styles.cityText, { color: selected ? colors.text : colors.textMuted }]}>
                  {getPassportCityLabel(locale, city)}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  done: {
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  current: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  methods: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cityText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
