// Einkgram — Font weight utilities (v0.18)
//
// Independent from the ON/OFF toggle — font weight can be
// adjusted whether or not E-Ink mode is active. Three levels:
// normal (no-op), medium (font-weight: 500), bold (600).
//
// Applied via data-eink-font-weight attribute on <html>.
// CSS rules in _reset.scss increase font-weight on body text
// while leaving headings (already bold) unchanged.
//
// Green zone: pure utilities, no upstream code touched.

import {
  DEFAULT_FONT_WEIGHT,
  FONT_WEIGHT_ATTR,
  FONT_WEIGHT_CYCLE,
  FONT_WEIGHT_STORAGE_KEY,
  type FontWeightLevel,
} from './constants';

export { FONT_WEIGHT_ATTR, type FontWeightLevel };

/** Type guard: is `v` a valid FontWeightLevel string? */
export function isFontWeightLevel(v: unknown): v is FontWeightLevel {
  return v === 'normal' || v === 'medium' || v === 'bold';
}

/** Read the user's stored font weight preference. */
export function readStoredFontWeight(): FontWeightLevel {
  if (typeof localStorage === 'undefined') return DEFAULT_FONT_WEIGHT;
  try {
    const v = localStorage.getItem(FONT_WEIGHT_STORAGE_KEY);
    if (isFontWeightLevel(v)) return v;
  } catch {
    // ignore
  }
  return DEFAULT_FONT_WEIGHT;
}

/** Persist the user's font weight preference. */
export function writeStoredFontWeight(level: FontWeightLevel): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(FONT_WEIGHT_STORAGE_KEY, level);
  } catch {
    // ignore
  }
}

/** Apply font weight to <html> via data-eink-font-weight attr. */
export function applyFontWeightToDom(level: FontWeightLevel): void {
  if (typeof document === 'undefined') return;
  if (level === 'normal') {
    document.documentElement.removeAttribute(FONT_WEIGHT_ATTR);
  } else {
    document.documentElement.setAttribute(FONT_WEIGHT_ATTR, level);
  }
}

/** Read current font weight from <html> attribute. */
export function readFontWeightFromDom(): FontWeightLevel {
  if (typeof document === 'undefined') return DEFAULT_FONT_WEIGHT;
  const v = document.documentElement.getAttribute(FONT_WEIGHT_ATTR);
  if (isFontWeightLevel(v)) return v;
  return DEFAULT_FONT_WEIGHT;
}

/** Cycle to the next level: normal→medium→bold→normal. */
export function cycleFontWeight(current: FontWeightLevel): FontWeightLevel {
  const idx = FONT_WEIGHT_CYCLE.indexOf(current);
  if (idx === -1) return FONT_WEIGHT_CYCLE[0];
  return FONT_WEIGHT_CYCLE[(idx + 1) % FONT_WEIGHT_CYCLE.length];
}

/** Apply the initial font weight before first paint. */
export function applyInitialFontWeight(): void {
  applyFontWeightToDom(readStoredFontWeight());
}
