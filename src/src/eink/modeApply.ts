// Einkgram — Mode application utilities (v0.16)
//
// v0.16: Simplified from 4-mode (off/standard/1bit/paper) to a
// single ON/OFF toggle. No CSS classes per mode; just toggles
// the eink-mode class on <html>. JS dithering removed — the
// E-Ink device driver handles grayscale mapping.
//
// Green zone: pure utilities, no upstream code touched.

import {
  CLASS_EINK,
  DEFAULT_EINK_MODE,
  EINK_MODE_CYCLE_ORDER,
  EINK_MODE_STORAGE_KEY,
  type EinkMode,
} from './constants';

export {
  CLASS_EINK,
  DEFAULT_EINK_MODE,
  EINK_MODE_CYCLE_ORDER,
  EINK_MODE_STORAGE_KEY,
  EINK_MODE_LABELS,
  type EinkMode,
} from './constants';

/** Type guard: is `v` a valid EinkMode string? */
export function isEinkMode(v: unknown): v is EinkMode {
  return v === 'off' || v === 'on';
}

/** Read the user's stored preference, falling back to DEFAULT_EINK_MODE. */
export function readStoredMode(): EinkMode {
  if (typeof localStorage === 'undefined') return DEFAULT_EINK_MODE;
  try {
    const v = localStorage.getItem(EINK_MODE_STORAGE_KEY);
    if (isEinkMode(v)) return v;
  } catch {
    // ignore quota / privacy mode errors
  }
  return DEFAULT_EINK_MODE;
}

/** Persist the user's mode preference. Silent on storage errors. */
export function writeStoredMode(mode: EinkMode): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(EINK_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

/** Apply the mode to <html>: add/remove the eink-mode class. */
export function applyModeToDom(mode: EinkMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(CLASS_EINK, mode === 'on');
}

/** Read the current mode from <html> classes. */
export function readModeFromDom(): EinkMode {
  if (typeof document === 'undefined') return DEFAULT_EINK_MODE;
  return document.documentElement.classList.contains(CLASS_EINK) ? 'on' : 'off';
}

/** Cycle to the next mode in EINK_MODE_CYCLE_ORDER. Wraps. */
export function cycleMode(current: EinkMode): EinkMode {
  const idx = EINK_MODE_CYCLE_ORDER.indexOf(current);
  if (idx === -1) return EINK_MODE_CYCLE_ORDER[0];
  return EINK_MODE_CYCLE_ORDER[(idx + 1) % EINK_MODE_CYCLE_ORDER.length];
}
