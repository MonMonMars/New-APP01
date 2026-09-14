export type FaceFocalPoint = {
  x: number;
  y: number;
};

const DEFAULT_FOCAL: FaceFocalPoint = { x: 0.5, y: 0.38 };

const focalCache = new Map<string, FaceFocalPoint>();

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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

async function detectFaceFocalOnWeb(imageUrl: string): Promise<FaceFocalPoint | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const FaceDetectorCtor = (window as Window & { FaceDetector?: new (opts?: object) => BrowserFaceDetector })
    .FaceDetector;
  if (!FaceDetectorCtor) {
    return null;
  }

  try {
    const img = await loadImageElement(imageUrl);
    const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });
    const faces = await detector.detect(img);
    if (faces.length === 0) {
      return null;
    }

    const box = faces[0].boundingBox;
    return {
      x: (box.x + box.width / 2) / img.naturalWidth,
      y: (box.y + box.height / 2) / img.naturalHeight,
    };
  } catch {
    return null;
  }
}

/** Returns normalized focal point (0–1) for centering a face in a circular thumbnail. */
export async function getFaceFocalPoint(imageUrl: string): Promise<FaceFocalPoint> {
  const cached = focalCache.get(imageUrl);
  if (cached) {
    return cached;
  }

  const detected = await detectFaceFocalOnWeb(imageUrl);
  const focal = detected ?? DEFAULT_FOCAL;
  focalCache.set(imageUrl, focal);
  return focal;
}

export function focalToContentPosition(focal: FaceFocalPoint): { top: `${number}%`; left: `${number}%` } {
  const clamp = (value: number) => Math.min(0.92, Math.max(0.08, value));
  return {
    top: `${clamp(focal.y) * 100}%`,
    left: `${clamp(focal.x) * 100}%`,
  };
}
