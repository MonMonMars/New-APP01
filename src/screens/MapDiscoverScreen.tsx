import { ExpandSearchMap } from '../components/ExpandLocationSheet';

type MapDiscoverScreenProps = {
  onClose: () => void;
};

export function MapDiscoverScreen({ onClose }: MapDiscoverScreenProps) {
  return <ExpandSearchMap onClose={onClose} />;
}
