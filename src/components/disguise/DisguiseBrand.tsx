import { ViewStyle } from 'react-native';

import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { PulseBrand, PulseBrandMark, PulseHeaderLogo } from './PulseBrandMark';

type DisguiseBrandProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: ViewStyle;
};

/** Pulse disguise masthead — shared by Spark and Ember. */
export function DisguiseBrand({ size = 'md', showTagline = false, style }: DisguiseBrandProps) {
  const meta = useDisguiseWorld();
  return <PulseBrand size={size} showTagline={showTagline} tagline={meta.tagline} style={style} />;
}

export function DisguiseBrandMark({
  size = 'md',
  muted = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
}) {
  return <PulseBrandMark size={size} muted={muted} />;
}

export function DisguiseHeaderLogo() {
  return <PulseHeaderLogo size="sm" />;
}
