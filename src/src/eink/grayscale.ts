// Einkgram — 16-level grayscale dithering (v0.2)
//
// Pure-function grayscale + Floyd-Steinberg dithering for
// image bitmaps, intended to be applied to chat images /
// stickers / photos so they render cleanly on 16-level E-Ink.
//
// NOT YET WIRED into MessageMedia — v0.3 work. Right now it's
// exposed as a library function and a `window.__eink.ditherImage`
// helper for ad-hoc testing in DevTools.
//
// Green zone: no upstream code touched.

export const RAMP_16 = [
  0, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255,
] as const;

export function rgbToGray(r: number, g: number, b: number): number {
  // Rec. 601 luma — same weights browsers use for grayscale(1)
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function quantize(gray: number, ramp: readonly number[] = RAMP_16): number {
  // Find closest ramp entry
  let best = ramp[0];
  let bestDist = Math.abs(gray - best);
  for (let i = 1; i < ramp.length; i++) {
    const d = Math.abs(gray - ramp[i]);
    if (d < bestDist) {
      bestDist = d;
      best = ramp[i];
    }
  }
  return best;
}

export function ditherToCanvas(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  options: { levels?: number; width?: number; height?: number } = {},
): HTMLCanvasElement {
  const { width, height } = options;
  const sw = width ?? ('width' in source ? source.width : 0);
  const sh = height ?? ('height' in source ? source.height : 0);

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Einkgram: 2d context unavailable');

  ctx.drawImage(source as CanvasImageSource, 0, 0, sw, sh);
  const image = ctx.getImageData(0, 0, sw, sh);
  const data = image.data;

  // Floyd-Steinberg error diffusion over R channel.
  // We only store error on R since all channels get gray = R.
  const err = new Float32Array(sw * sh);

  // Pass 1: compute grayscale + error buffer
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const g = rgbToGray(data[i], data[i + 1], data[i + 2]);
      err[y * sw + x] = g;
    }
  }

  // Pass 2: quantize + diffuse error
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const idx = y * sw + x;
      const oldPixel = err[idx];
      const newPixel = quantize(oldPixel);
      const error = oldPixel - newPixel;
      const i = idx * 4;

      data[i] = newPixel;
      data[i + 1] = newPixel;
      data[i + 2] = newPixel;
      data[i + 3] = 255;

      // Distribute error to neighbors (Floyd-Steinberg coefficients)
      if (x + 1 < sw) err[idx + 1] += (error * 7) / 16;
      if (y + 1 < sh) {
        if (x > 0) err[idx + sw - 1] += (error * 3) / 16;
        err[idx + sw] += (error * 5) / 16;
        if (x + 1 < sw) err[idx + sw + 1] += (error * 1) / 16;
      }
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

async function loadBitmap(
  source: HTMLImageElement | Blob | string,
): Promise<ImageBitmap | HTMLImageElement> {
  if (source instanceof Blob && typeof createImageBitmap !== 'undefined') {
    try {
      return await createImageBitmap(source);
    } catch {
      // fall through to HTMLImageElement path
    }
  }
  if (source instanceof HTMLImageElement) return source;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = typeof source === 'string' ? source : URL.createObjectURL(source);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Einkgram: image load failed'));
  });
  return img;
}

export async function ditherImage(
  source: HTMLImageElement | Blob | string,
  options: { levels?: number; width?: number; height?: number } = {},
): Promise<HTMLCanvasElement> {
  const bitmap = await loadBitmap(source);
  return ditherToCanvas(bitmap, options);
}
