import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EXPLORE_CATEGORY_MAP, mockProfiles } from '../data/profiles';
import { useTranslation } from '../i18n';
import { matchesSparkSection, resolveSparkSection, SparkSection } from '../types/preferences';
import { isEmberRelationshipStatus, emberLocationLine, Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { EmberStatusChips } from '../components/EmberStatusChips';

type ExploreCategory = 'serious' | 'new' | 'nearby';

const CATEGORY_META: {
  id: ExploreCategory;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'serious', icon: 'heart-circle' },
  { id: 'new', icon: 'sparkles' },
  { id: 'nearby', icon: 'location' },
];

type ExploreScreenProps = {
  onClose: () => void;
};

function profilesForCategory(
  category: ExploreCategory,
  excluded: Set<string>,
  section: SparkSection,
): Profile[] {
  return mockProfiles.filter((profile) => {
    if (excluded.has(profile.id)) {
      return false;
    }
    if (!matchesSparkSection(profile, section)) {
      return false;
    }
    return EXPLORE_CATEGORY_MAP[profile.id] === category;
  }).slice(0, 6);
}

export function ExploreScreen({ onClose }: ExploreScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { passedIds, likedIds, blockedIds, prioritizeProfileInDeck, preferences } = useApp();

  const excluded = new Set([...passedIds, ...likedIds, ...blockedIds]);
  const section = resolveSparkSection(preferences.sparkSection);
  const isEmber = section === 'ember';

  const openInDeck = (profileId: string) => {
    prioritizeProfileInDeck(profileId);
    onClose();
    navigation.getParent()?.navigate('Main', { screen: 'Discover' });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader title={t('explore.title')} leftIcon="close" onLeftPress={onClose} showLogo />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lead, { color: colors.textMuted }]}>
          {isEmber ? t('explore.leadEmber') : t('explore.leadSpark')}
        </Text>

        {CATEGORY_META.map((category) => {
          const profiles = profilesForCategory(category.id, excluded, section);
          const labelKey = `explore.categories.${category.id}.label` as const;
          const emberLabelKey = `explore.categories.${category.id}.emberLabel` as const;
          const descKey = `explore.categories.${category.id}.description` as const;
          const emberDescKey = `explore.categories.${category.id}.emberDescription` as const;

          return (
            <View key={category.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={category.icon} size={20} color={colors.gradientEnd} />
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t(isEmber ? emberLabelKey : labelKey)}
                  </Text>
                  <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
                    {t(isEmber ? emberDescKey : descKey)}
                  </Text>
                </View>
              </View>

              {profiles.length === 0 ? (
                <Text style={[styles.empty, { color: colors.textMuted }]}>{t('explore.emptyStack')}</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                  {profiles.map((profile) => (
                    <AnimatedPressable
                      key={profile.id}
                      style={[styles.card, { backgroundColor: colors.surface }]}
                      onPress={() => openInDeck(profile.id)}
                      accessibilityRole="button"
                      accessibilityLabel={t('explore.viewProfileA11y', { name: profile.name })}
                    >
                      <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
                      <Text style={[styles.name, { color: colors.text }]}>{profile.name}, {profile.age}</Text>
                      {isEmberRelationshipStatus(profile.relationshipStatus) ? (
                        <>
                          <View style={styles.chips}>
                            <EmberStatusChips profile={profile} compact />
                          </View>
                          <Text style={[styles.distance, { color: colors.textMuted }]}>
                            {emberLocationLine(profile)}
                          </Text>
                        </>
                      ) : (
                        <Text style={[styles.distance, { color: colors.textMuted }]}>
                          {t('likes.milesAway', { n: profile.distanceMiles })}
                        </Text>
                      )}
                    </AnimatedPressable>
                  ))}
                </ScrollView>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  lead: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionDesc: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    gap: spacing.sm,
  },
  card: {
    width: 140,
    borderRadius: radii.card,
    overflow: 'hidden',
    paddingBottom: spacing.sm,
  },
  photo: {
    width: '100%',
    height: 170,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  distance: {
    fontSize: 12,
    paddingHorizontal: spacing.sm,
    fontWeight: '600',
  },
  chips: {
    paddingHorizontal: spacing.sm,
    marginTop: 4,
  },
  empty: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
