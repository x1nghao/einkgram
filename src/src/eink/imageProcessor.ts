// Einkgram — Panel-aware image processor (v0.4)
//
// Replaces the v0.2/v0.3 `grayscale.ts` with a single entry point
// `processForPanel(sourceImage, panelType)` that dispatches to the
// right algorithm for the panel.
//
// All processors share:
//   - Rec. 601 luma (matches browser grayscale(1) weights)
//   - Optional pre-processing (gamma + S-curve + saturation) — stub for v0.5
//   - Canvas-based output (returns HTMLCanvasElement for <MessageMedia />)
//
// v0.4 ships: 1bit, 4gray, 16gray, 256gray, color-4096, color-30000.
// v0.5 will add: pre-processing pipeline (gamma + S-curve + saturation).
//
// Green zone: pure utility module, no upstream touched.

import { rgbToGray, hexToGray } from './grayscale';
import type { PanelType, DitherAlgorithm } from './panels';
import { recommendAlgorithm, recommendLevels, panelIsColor } from './panels';

// Re-export ramp constants from v0.3 (now legacy in favor of panels.ts).
// Kept for back-compat with code that imported the v0.2/v0.3 names.
export { RAMP_16_LINEAR as RAMP_16, hexToGray, rgbToGray } from './grayscale';

// ─────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────

/**
 * Process a source image for the given panel type.
 * Returns a new HTMLCanvasElement (or the source if panel is 'unknown'
 * and we'd be a no-op).
 *
 * @param source  An HTMLImageElement | HTMLCanvasElement | ImageBitmap
 *                that is fully loaded (img.complete === true for <img>).
 * @param panel   The target panel type.
 * @returns       A new canvas with the processed image, or the source
 *                if the panel is 'unknown' and no processing is needed.
 */
export function processForPanel(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  panel: PanelType,
): HTMLCanvasElement {
  const algo = recommendAlgorithm(panel);
  const levels = recommendLevels(panel);
  const keepColor = panelIsColor(panel);

  if (panel === 'unknown') {
    // Pass-through: let upstream CSS handle it.
    return toCanvas(source);
  }

  if (keepColor) {
    return quantizeColor(source, levels);
  }

  // Grayscale path
  return ditherGrayscale(source, levels, algo);
}

/**
 * @deprecated in v0.4 — use `processForPanel(source, '16gray')` instead.
 * Kept for back-compat with v0.2/v0.3 callers.
 */
export function ditherImage(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
): HTMLCanvasElement {
  return processForPanel(source, '16gray');
}

// ─────────────────────────────────────────────────────────
// Grayscale dithering
// ─────────────────────────────────────────────────────────

/**
 * Convert to grayscale + apply a dithering algorithm at the given level count.
 * levels=2 means 1-bit threshold; levels=16 means FS dither; etc.
 */
function ditherGrayscale(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  levels: number,
  algo: DitherAlgorithm,
): HTMLCanvasElement {
  const w = source.width;
  const h = source.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return toCanvas(source);

  // Draw the source
  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  switch (algo) {
    case 'threshold':
      applyThreshold(data, levels);
      break;
    case 'floyd-steinberg':
      applyFloydSteinberg(data, w, h, levels);
      break;
    case 'atkinson':
      applyAtkinson(data, w, h, levels);
      break;
    case 'stucki':
      applyStucki(data, w, h, levels);
      break;
    case 'median-cut':
      // Shouldn't reach here for gray panels, but fall through
      applyFloydSteinberg(data, w, h, levels);
      break;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Hard threshold to `levels` evenly-spaced values. No error diffusion. */
function applyThreshold(data: Uint8ClampedArray, levels: number): void {
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    const g = rgbToGray(data[i], data[i + 1], data[i + 2]);
    const quantized = Math.round(g / step) * step;
    data[i] = data[i + 1] = data[i + 2] = quantized;
  }
}

/**
 * Floyd-Steinberg error-diffusion dithering.
 * Error distribution (classic, 1976):
 *   | | * | 7/16 |
 *   | 3/16 | 5/16 | 1/16 |
 */
function applyFloydSteinberg(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  levels: number,
): void {
  const step = 255 / (levels - 1);
  // Work on a copy so we don't double-modify RGBA channels in place.
  const buf = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) buf[i] = data[i];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (buf[i + 3] === 0) continue;
      const old = rgbToGray(buf[i], buf[i + 1], buf[i + 2]);
      const quantized = Math.round(old / step) * step;
      const err = old - quantized;
      buf[i] = buf[i + 1] = buf[i + 2] = quantized;

      // Right (x+1, y): 7/16
      if (x + 1 < w) distribute(buf, i + 4, err * 0.4375);
      // Below-left (x-1, y+1): 3/16
      if (x > 0 && y + 1 < h) distribute(buf, i + w * 4 - 4, err * 0.1875);
      // Below (x, y+1): 5/16
      if (y + 1 < h) distribute(buf, i + w * 4, err * 0.3125);
      // Below-right (x+1, y+1): 1/16
      if (x + 1 < w && y + 1 < h) distribute(buf, i + w * 4 + 4, err * 0.0625);
    }
  }
  for (let i = 0; i < data.length; i++) data[i] = Math.max(0, Math.min(255, Math.round(buf[i])));
}

/**
 * Atkinson dithering — softer than FS, used in classic Mac OS.
 * Distributes only 6/8 of the error (the remaining 2/8 is "lost"
 * which preserves highlights and gives a cleaner look).
 */
function applyAtkinson(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  levels: number,
): void {
  const step = 255 / (levels - 1);
  const buf = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) buf[i] = data[i];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (buf[i + 3] === 0) continue;
      const old = rgbToGray(buf[i], buf[i + 1], buf[i + 2]);
      const quantized = Math.round(old / step) * step;
      const err = (old - quantized) / 8; // each pixel gets 1/8 of error
      buf[i] = buf[i + 1] = buf[i + 2] = quantized;

      // 6 neighbors, each gets 1/8
      if (x + 1 < w) distribute(buf, i + 4, err);
      if (x + 2 < w) distribute(buf, i + 8, err);
      if (x > 0 && y + 1 < h) distribute(buf, i + w * 4 - 4, err);
      if (y + 1 < h) distribute(buf, i + w * 4, err);
      if (x + 1 < w && y + 1 < h) distribute(buf, i + w * 4 + 4, err);
      if (y + 2 < h) distribute(buf, i + w * 8, err);
    }
  }
  for (let i = 0; i < data.length; i++) data[i] = Math.max(0, Math.min(255, Math.round(buf[i])));
}

/**
 * Stucki dithering — similar to FS but with a wider diffusion kernel.
 * Smoother gradients, slightly more expensive.
 */
function applyStucki(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  levels: number,
): void {
  const step = 255 / (levels - 1);
  const buf = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) buf[i] = data[i];

  // Stucki kernel weights (sum = 42)
  //   | | * | 8 | 4 |
  //   | 2 | 4 | 8 | 4 | 2 |
  //   | 1 | 2 | 4 | 2 | 1 |
  const divisors = 42;
  const kernel = [
    { dx: 1, dy: 0, w: 8 },
    { dx: 2, dy: 0, w: 4 },
    { dx: -2, dy: 1, w: 1 },
    { dx: -1, dy: 1, w: 2 },
    { dx: 0, dy: 1, w: 4 },
    { dx: 1, dy: 1, w: 8 },
    { dx: 2, dy: 1, w: 4 },
    { dx: -2, dy: 2, w: 1 },
    { dx: -1, dy: 2, w: 2 },
    { dx: 0, dy: 2, w: 4 },
    { dx: 1, dy: 2, w: 8 },
    { dx: 2, dy: 2, w: 4 },
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (buf[i + 3] === 0) continue;
      const old = rgbToGray(buf[i], buf[i + 1], buf[i + 2]);
      const quantized = Math.round(old / step) * step;
      const err = old - quantized;
      buf[i] = buf[i + 1] = buf[i + 2] = quantized;

      for (const k of kernel) {
        const nx = x + k.dx;
        const ny = y + k.dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        distribute(buf, (ny * w + nx) * 4, (err * k.w) / divisors);
      }
    }
  }
  for (let i = 0; i < data.length; i++) data[i] = Math.max(0, Math.min(255, Math.round(buf[i])));
}

function distribute(buf: Float32Array, i: number, err: number): void {
  buf[i] += err;
  buf[i + 1] += err;
  buf[i + 2] += err;
}

// ─────────────────────────────────────────────────────────
// Color quantization (median cut)
// ─────────────────────────────────────────────────────────

/**
 * Quantize a color image to `paletteSize` colors using median cut.
 * Much faster on E-Ink hardware than k-means; quality is good enough
 * for chat media (already heavily compressed JPEGs/AVIFs).
 *
 * v0.4: simple in-memory median cut on a downsampled pixel set.
 *       v0.5: move to a Web Worker for large images.
 */
function quantizeColor(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  paletteSize: number,
): HTMLCanvasElement {
  const w = source.width;
  const h = source.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return toCanvas(source);

  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Downsample for palette building (1 in 4 pixels is plenty)
  const sampleStep = Math.max(1, Math.floor((w * h) / 4096));
  const samples: number[] = [];
  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    if (data[i + 3] === 0) continue;
    samples.push(data[i], data[i + 1], data[i + 2]);
  }

  // Build palette
  const palette = medianCutPalette(samples, paletteSize);

  // Map each pixel to the nearest palette entry
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const nearest = nearestPaletteIndex(palette, data[i], data[i + 1], data[i + 2]);
    data[i] = palette[nearest * 3];
    data[i + 1] = palette[nearest * 3 + 1];
    data[i + 2] = palette[nearest * 3 + 2];
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function medianCutPalette(samples: number[], targetSize: number): number[] {
  if (samples.length === 0) return [0, 0, 0];

  // Each "bucket" is [r0, g0, b0, r1, g1, b1, ...] in 3-tuples
  let buckets: number[][] = [samples];
  while (buckets.length < targetSize) {
    // Find the bucket with the largest range
    let bestIdx = -1;
    let bestRange = 0;
    let bestChannel = 0;
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 6) continue; // 2 pixels min to split
      const rRange = channelRange(bucket, 0);
      const gRange = channelRange(bucket, 1);
      const bRange = channelRange(bucket, 2);
      const maxRange = Math.max(rRange, gRange, bRange);
      if (maxRange > bestRange) {
        bestRange = maxRange;
        bestIdx = i;
        bestChannel = rRange === maxRange ? 0 : gRange === maxRange ? 1 : 2;
      }
    }
    if (bestIdx < 0) break;
    const bucket = buckets[bestIdx];
    const sorted = sortByChannel(bucket, bestChannel);
    const mid = sorted.length / 2;
    const left = sorted.slice(0, mid);
    const right = sorted.slice(mid);
    buckets = [...buckets.slice(0, bestIdx), left, right, ...buckets.slice(bestIdx + 1)];
  }

  // Average each bucket
  return buckets.map((bucket) => {
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < bucket.length; i += 3) {
      r += bucket[i];
      g += bucket[i + 1];
      b += bucket[i + 2];
      n++;
    }
    return n === 0 ? [0, 0, 0] : [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  }).flat();
}

function channelRange(bucket: number[], channel: number): number {
  let min = 255;
  let max = 0;
  for (let i = channel; i < bucket.length; i += 3) {
    if (bucket[i] < min) min = bucket[i];
    if (bucket[i] > max) max = bucket[i];
  }
  return max - min;
}

function sortByChannel(bucket: number[], channel: number): number[] {
  // Sort the 3-tuples in `bucket` by the chosen channel (0=R, 1=G, 2=B)
  // and return the sorted flat array.
  const indices = Array.from({ length: bucket.length / 3 }, (_, i) => i);
  indices.sort((a, b) => bucket[a * 3 + channel] - bucket[b * 3 + channel]);
  const out: number[] = [];
  for (const i of indices) {
    out.push(bucket[i * 3], bucket[i * 3 + 1], bucket[i * 3 + 2]);
  }
  return out;
}

function nearestPaletteIndex(
  palette: number[],
  r: number,
  g: number,
  b: number,
): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i += 3) {
    const dr = r - palette[i];
    const dg = g - palette[i + 1];
    const db = b - palette[i + 2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = i / 3;
    }
  }
  return best;
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function toCanvas(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap): HTMLCanvasElement {
  if (source instanceof HTMLCanvasElement) return source;
  const w = 'width' in source ? source.width : 0;
  const h = 'height' in source ? source.height : 0;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(source, 0, 0);
  return canvas;
}
