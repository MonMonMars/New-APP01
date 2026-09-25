import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../i18n';
import { radii, spacing } from '../../theme';
import { modalFill } from '../../theme/modalFill';
import { NavigationPressable } from '../NavigationPressable';

type DisguiseUnlockConfirmProps = {
  visible: boolean;
  disguiseName: string;
  unlockLabel: string;
  accent: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Small confirm before leaving Pulse or Harbor. */
export function DisguiseUnlockConfirm({
  visible,
  disguiseName,
  unlockLabel,
  accent,
  onConfirm,
  onCancel,
}: DisguiseUnlockConfirmProps) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
      onRequestClose={onCancel}
    >
      <Pressable
        style={[styles.overlay, modalFill]}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
      >
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{t('disguiseConfirm.leaveTitle', { name: disguiseName })}</Text>
          <Text style={styles.body}>{t('disguiseConfirm.body', { unlockLabel })}</Text>
          <View style={styles.actions}>
            <NavigationPressable
              style={styles.stay}
              onPress={onCancel}
              accessibilityLabel={t('disguiseConfirm.stayA11y', { name: disguiseName })}
            >
              <Text style={styles.stayText}>{t('disguiseConfirm.stay')}</Text>
            </NavigationPressable>
            <NavigationPressable
              style={[styles.unlock, { backgroundColor: accent }]}
              onPress={onConfirm}
              accessibilityLabel={t('disguiseConfirm.leaveDisguiseA11y', { name: disguiseName })}
              accessibilityHint={t('disguiseConfirm.leaveHint', { unlockLabel })}
            >
              <Text style={styles.unlockText}>{t('disguiseConfirm.leaveDisguise', { name: disguiseName })}</Text>
            </NavigationPressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    borderRadius: radii.card,
    backgroundColor: '#1A1A1C',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: '#A0A0A5',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2A2A2E',
  },
  stayText: {
    color: '#A0A0A5',
    fontSize: 15,
    fontWeight: '700',
  },
  unlock: {
    flex: 1.15,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.button,
  },
  unlockText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
