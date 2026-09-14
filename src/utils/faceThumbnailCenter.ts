export type FaceFocalPoint = {
  x: number;
  y: number;
};

export type FaceCrop = {
  focal: FaceFocalPoint;
  /** Zoom multiplier so the detected face fills the circle comfortably. */
  scale: number;
};

const DEFAULT_CROP: FaceCrop = { focal: { x: 0.5, y: 0.32 }, scale: 1.55 };

const cropCache = new Map<string, FaceCrop>();

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Avoid crossOrigin — it breaks Unsplash loads when ACAO is missing; FaceDetector
    // does not need canvas access.
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}

type FaceDetectorBox = {
  boundingBox: { x: number; y: number; width: number; height: number };
};

type BrowserFaceDetector = {
  detect: (source: HTMLImageElement) => Promise<FaceDetectorBox[]>;
};

function cropFromFaceBox(
  box: FaceDetectorBox['boundingBox'],
  imageWidth: number,
  imageHeight: number,
): FaceCrop {
  const focal: FaceFocalPoint = {
    x: (box.x + box.width / 2) / imageWidth,
    y: (box.y + box.height / 2) / imageHeight,
  };

  const faceHeightNorm = box.height / imageHeight;
  const targetFaceRatio = 0.58;
  const scale = Math.min(2.85, Math.max(1.3, targetFaceRatio / Math.max(faceHeightNorm, 0.12)));

  return { focal, scale };
}

function heuristicCrop(width: number, height: number): FaceCrop {
  const aspect = width / height;

  if (aspect < 0.82) {
    return { focal: { x: 0.5, y: 0.27 }, scale: 1.75 };
  }
  if (aspect < 0.95) {
    return { focal: { x: 0.5, y: 0.3 }, scale: 1.6 };
  }
  if (aspect > 1.25) {
    return { focal: { x: 0.5, y: 0.4 }, scale: 1.35 };
  }
  return { focal: { x: 0.5, y: 0.34 }, scale: 1.5 };
}

async function detectFaceCropOnWeb(imageUrl: string): Promise<FaceCrop | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const FaceDetectorCtor = (window as Window & { FaceDetector?: new (opts?: object) => BrowserFaceDetector })
    .FaceDetector;

  try {
    const img = await loadImageElement(imageUrl);

    if (FaceDetectorCtor) {
      const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(img);
      if (faces.length > 0) {
        return cropFromFaceBox(faces[0].boundingBox, img.naturalWidth, img.naturalHeight);
      }
    }

    return heuristicCrop(img.naturalWidth, img.naturalHeight);
  } catch {
    return null;
  }
}

/** Returns focal point + zoom for centering a face in a circular thumbnail. */
export async function getFaceCrop(imageUrl: string): Promise<FaceCrop> {
  const cached = cropCache.get(imageUrl);
  if (cached) {
    return cached;
  }

  const detected = await detectFaceCropOnWeb(imageUrl);
  const crop = detected ?? DEFAULT_CROP;
  cropCache.set(imageUrl, crop);
  return crop;
}

/** @deprecated Use getFaceCrop — kept for callers that only need the focal point. */
export async function getFaceFocalPoint(imageUrl: string): Promise<FaceFocalPoint> {
  const crop = await getFaceCrop(imageUrl);
  return crop.focal;
}

export function focalToContentPosition(focal: FaceFocalPoint): { top: `${number}%`; left: `${number}%` } {
  const clamp = (value: number) => Math.min(0.92, Math.max(0.08, value));
  return {
    top: `${clamp(focal.y) * 100}%`,
    left: `${clamp(focal.x) * 100}%`,
  };
}

export function cropToImageLayout(crop: FaceCrop, size: number): {
  width: number;
  height: number;
  left: number;
  top: number;
} {
  const scaled = size * crop.scale;
  return {
    width: scaled,
    height: scaled,
    left: size / 2 - crop.focal.x * scaled,
    top: size / 2 - crop.focal.y * scaled,
  };
}
