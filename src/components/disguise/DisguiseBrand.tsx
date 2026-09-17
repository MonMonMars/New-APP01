import { ViewStyle } from 'react-native';

import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { HarborBrand, HarborBrandMark } from './HarborBrandMark';
import { PulseBrand, PulseBrandMark } from './PulseBrandMark';

type DisguiseBrandProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: ViewStyle;
};

/** Pulse (Spark) or Harbor (Ember) masthead — never both. */
export function DisguiseBrand({ size = 'md', showTagline = false, style }: DisguiseBrandProps) {
  const meta = useDisguiseWorld();
  switch (meta.world) {
    case 'harbor':
      return <HarborBrand size={size} showTagline={showTagline} style={style} />;
    case 'pulse':
      return <PulseBrand size={size} showTagline={showTagline} tagline={meta.tagline} style={style} />;
    default: {
      const _exhaustive: never = meta.world;
      return _exhaustive;
    }
  }
}

export function DisguiseBrandMark({
  size = 'md',
  muted = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
}) {
  const meta = useDisguiseWorld();
  switch (meta.world) {
    case 'harbor':
      return <HarborBrandMark size={size} muted={muted} />;
    case 'pulse':
      return <PulseBrandMark size={size} muted={muted} />;
    default: {
      const _exhaustive: never = meta.world;
      return _exhaustive;
    }
  }
}
