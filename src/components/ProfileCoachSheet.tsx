import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { generateProfileCoachSuggestions } from '../services/profileCoach';
import { UserProfile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ProfileCoachSheetProps = {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onApplyBio: (bio: string) => void;
  onApplyOpeningMove: (openingMove: string) => void;
};

export function ProfileCoachSheet({
  visible,
  user,
  onClose,
  onApplyBio,
  onApplyOpeningMove,
}: ProfileCoachSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [bios, setBios] = useState<string[]>([]);
  const [openingMoves, setOpeningMoves] = useState<string[]>([]);
  const [source, setSource] = useState<'llm' | 'local'>('local');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setLoading(true);
    void generateProfileCoachSuggestions(user)
      .then((result) => {
        setBios(result.bios);
        setOpeningMoves(result.openingMoves);
        setSource(result.source);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{t('profileCoach.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.intro, { color: colors.textMuted }]}>
            {t('profileCoach.intro')}
            {source === 'llm' ? t('profileCoach.poweredByGroq') : ''}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.gradientEnd} style={styles.loader} />
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                {t('profileCoach.bioIdeas')}
              </Text>
              {bios.map((bio) => (
                <AnimatedPressable
                  key={bio}
                  style={[styles.suggestion, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    onApplyBio(bio);
                    onClose();
                  }}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{bio}</Text>
                  <Text style={[styles.applyLabel, { color: colors.gradientEnd }]}>
                    {t('profileCoach.useThis')}
                  </Text>
                </AnimatedPressable>
              ))}

              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                {t('profileCoach.openingMoves')}
              </Text>
              {openingMoves.map((move) => (
                <AnimatedPressable
                  key={move}
                  style={[styles.suggestion, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    onApplyOpeningMove(move);
                    onClose();
                  }}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{move}</Text>
                  <Text style={[styles.applyLabel, { color: colors.gradientEnd }]}>
                    {t('profileCoach.useThis')}
                  </Text>
                </AnimatedPressable>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  suggestion: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  applyLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
});
