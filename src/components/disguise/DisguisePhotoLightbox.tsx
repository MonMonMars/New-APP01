import { NewsReporter } from '../../data/disguiseFeed';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import { resolveExplicitDatingProfile } from '../../utils/resolveDisguiseProfile';
import { PersonPreviewSheet } from './PersonPreviewSheet';

type DisguisePhotoLightboxProps = {
  visible: boolean;
  reporter: NewsReporter | null;
  /** Kept for call-site compatibility — photo is taken from reporter.photos[photoIndex]. */
  photoUrl?: string | null;
  photoIndex: number;
  onClose: () => void;
};

/** Compact disguise mini window — delegates to PersonPreviewSheet. */
export function DisguisePhotoLightbox({
  visible,
  reporter,
  photoIndex,
  onClose,
}: DisguisePhotoLightboxProps) {
  const pulseSection = usePulseContextSection();
  const linkedProfile = reporter
    ? resolveExplicitDatingProfile(reporter.profileId, pulseSection)
    : null;

  if (!linkedProfile) {
    return null;
  }

  return (
    <PersonPreviewSheet
      visible={visible}
      reporter={reporter}
      onClose={onClose}
      initialPhotoIndex={photoIndex}
    />
  );
}
