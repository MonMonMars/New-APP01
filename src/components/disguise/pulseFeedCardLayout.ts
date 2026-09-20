import { StyleSheet, ViewStyle } from 'react-native';

/** Match Pulse feed cards to the 480px web phone frame (same width as social posts). */
export const PULSE_FEED_CARD_MAX_WIDTH = 480;

export const pulseFeedCardShell: ViewStyle = {
  width: '100%',
  maxWidth: '100%',
  alignSelf: 'stretch',
};

export const pulseFeedCardStyles = StyleSheet.create({
  shell: pulseFeedCardShell,
});
