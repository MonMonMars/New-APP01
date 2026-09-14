import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { MessageStatus } from '../types/match';

type MessageStatusIconProps = {
  status?: MessageStatus;
  size?: number;
};

export function MessageStatusIcon({ status = 'sent', size = 14 }: MessageStatusIconProps) {
  const { colors } = useTheme();

  switch (status) {
    case 'sent':
      return <Ionicons name="checkmark" size={size} color={colors.textMuted} />;
    case 'delivered':
      return <Ionicons name="checkmark-done" size={size} color={colors.textMuted} />;
    case 'read':
      return <Ionicons name="checkmark-done" size={size} color={colors.superLike} />;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
