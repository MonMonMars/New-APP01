import { NewsReporter } from '../../data/disguiseFeed';
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
  return (
    <PersonPreviewSheet
      visible={visible}
      reporter={reporter}
      onClose={onClose}
      initialPhotoIndex={photoIndex}
    />
  );
}
