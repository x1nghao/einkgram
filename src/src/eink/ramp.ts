// Einkgram — 16-level grayscale ramp utilities (v0.3)
//
// In v0.2, RAMP_16 was hardcoded as `0, 17, 34, ... 255` (a linear ramp)
// while the SCSS `$eink-ramp` used a perceptually-tuned non-uniform ramp.
// These did not agree.
//
// v0.3 fixes this by:
//  1. Reading the values from CSS custom properties at runtime
//     (--eink-ramp-0 .. --eink-ramp-15, set by _mode.scss on :root).
//  2. Providing `getRamp16()` which returns the current ramp as numbers.
//  3. Falling back to the linear ramp if CSS variables aren't yet available
//     (e.g. when called during init.ts before the stylesheet is applied).
//
// Green zone: pure utility, no upstream touched.

import { RAMP_16_LINEAR, hexToGray } from './grayscale';

/**
 * Read the 16-level ramp from CSS custom properties (--eink-ramp-*).
 * Returns null if the variables aren't set (e.g. pre-stylesheet, or
 * the eink styles failed to load).
 */
export function readRampFromCss(): number[] | null {
  if (typeof document === 'undefined') return null;
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const ramp: number[] = [];
  for (let i = 0; i < 16; i++) {
    const v = style.getPropertyValue(`--eink-ramp-${i}`).trim();
    if (!v) return null; // stylesheet not applied yet
    ramp.push(hexToGray(v));
  }
  return ramp;
}

// v0.7 audit fix: cache the CSS-derived ramp. Previously
// every getRamp16() call invoked getComputedStyle() 16
// times, which is expensive when called from per-pixel
// dithering paths. The cache is keyed on the document
// element so the user can swap panels (which change
// --eink-ramp-*) by calling clearRampCache().
let rampCache: number[] | null = null;
let rampCacheRoot: Element | null = null;

function getRampFromCache(): number[] | null {
  const root = document.documentElement;
  if (rampCache && rampCacheRoot === root) return rampCache;
  const fresh = readRampFromCss();
  if (fresh) {
    rampCache = fresh;
    rampCacheRoot = root;
  }
  return fresh;
}

/** Invalidate the ramp cache. Call this after changing eink mode
 *  (since --eink-ramp-* values may differ between modes). */
export function clearRampCache(): void {
  rampCache = null;
  rampCacheRoot = null;
}

/**
 * Get the active 16-level ramp, preferring the CSS-defined
 * perceptually-tuned values, falling back to a linear ramp.
 *
 * v0.7: results are memoized per document root. Call
 * `clearRampCache()` after changing eink mode.
 *
 * @param {boolean} useCss If false, always return the linear fallback
 *   (useful for tests and for the initial render before stylesheet loads).
 */
export function getRamp16(useCss = true): readonly number[] {
  if (useCss) {
    const fromCache = getRampFromCache();
    if (fromCache) return fromCache;
  }
  return RAMP_16_LINEAR;
}

/**
 * Quantize a gray value [0, 255] to the nearest ramp entry.
 * Uses the active ramp (CSS-first, linear fallback).
 */
export function quantizeWithActiveRamp(gray: number): number {
  const ramp = getRamp16();
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
