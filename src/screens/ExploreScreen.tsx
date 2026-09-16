import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EXPLORE_CATEGORY_MAP, mockProfiles } from '../data/profiles';
import { matchesSparkSection, SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type ExploreCategory = 'serious' | 'new' | 'nearby';

const CATEGORIES: { id: ExploreCategory; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  {
    id: 'serious',
    label: 'Serious daters',
    icon: 'heart-circle',
    description: 'Looking for something real',
  },
  {
    id: 'new',
    label: 'New members',
    icon: 'sparkles',
    description: 'Just joined Spark',
  },
  {
    id: 'nearby',
    label: 'Nearby',
    icon: 'location',
    description: 'Within 10 miles',
  },
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
  const { passedIds, likedIds, blockedIds, prioritizeProfileInDeck, preferences } = useApp();

  const excluded = new Set([...passedIds, ...likedIds, ...blockedIds]);

  const openInDeck = (profileId: string) => {
    prioritizeProfileInDeck(profileId);
    onClose();
    navigation.getParent()?.navigate('Main', { screen: 'Discover' });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader title="Explore" leftIcon="close" onLeftPress={onClose} showDisguiseButton />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lead, { color: colors.textMuted }]}>
          Curated stacks inspired by Hinge Standouts &amp; Bumble For You
        </Text>

        {CATEGORIES.map((category) => {
          const profiles = profilesForCategory(
            category.id,
            excluded,
            preferences.sparkSection ?? 'dating',
          );
          return (
            <View key={category.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={category.icon} size={20} color={colors.gradientEnd} />
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{category.label}</Text>
                  <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>{category.description}</Text>
                </View>
              </View>

              {profiles.length === 0 ? (
                <Text style={[styles.empty, { color: colors.textMuted }]}>No profiles in this stack right now</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                  {profiles.map((profile) => (
                    <AnimatedPressable
                      key={profile.id}
                      style={[styles.card, { backgroundColor: colors.surface }]}
                      onPress={() => openInDeck(profile.id)}
                    >
                      <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
                      <Text style={[styles.name, { color: colors.text }]}>{profile.name}, {profile.age}</Text>
                      <Text style={[styles.distance, { color: colors.textMuted }]}>{profile.distanceMiles} mi</Text>
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
  empty: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
