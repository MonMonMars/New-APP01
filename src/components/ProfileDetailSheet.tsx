import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme';
import { Profile } from '../types/profile';

type ProfileDetailSheetProps = {
  profile: Profile | null;
  visible: boolean;
  onClose: () => void;
};

export function ProfileDetailSheet({
  profile,
  visible,
  onClose,
}: ProfileDetailSheetProps) {
  const insets = useSafeAreaInsets();

  if (!profile) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.toolbar}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: profile.photos[0] }} style={styles.hero} />

          <View style={styles.section}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {profile.name}, {profile.age}
              </Text>
              {profile.verified && (
                <Ionicons name="checkmark-circle" size={22} color={colors.superLike} />
              )}
            </View>
            {profile.job && <Text style={styles.meta}>{profile.job}</Text>}
            {profile.school && <Text style={styles.meta}>{profile.school}</Text>}
            <Text style={styles.distance}>{profile.distanceMiles} miles away</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>

          {profile.prompts?.map((prompt) => (
            <View key={prompt.question} style={styles.promptCard}>
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              <Text style={styles.promptAnswer}>{prompt.answer}</Text>
            </View>
          ))}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  toolbar: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 420,
    resizeMode: 'cover',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  distance: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  bio: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  promptCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  promptQuestion: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  promptAnswer: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.sm,
    lineHeight: 26,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
