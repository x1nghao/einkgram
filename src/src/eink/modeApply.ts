// Einkgram — Mode application utilities (v0.8)
//
// Before v0.8, the DOM-and-localStorage logic for the E-Ink mode
// was duplicated in three places:
//   - init/mode.ts (applyInitialMode)
//   - useEinkMode.ts (applyModeToDom, readStoredMode)
//   - init/shortcut.ts (currentFromDom, setMode)
//
// This file consolidates them into a single set of pure functions.
// Each function is small and side-effect-isolated; tests can call
// them directly without mocking React or the init lifecycle.
//
// Green zone: pure utilities, no upstream code touched.

import {
  CLASS_1BIT,
  CLASS_EINK,
  CLASS_PAPER,
  DEFAULT_EINK_MODE,
  EINK_MODE_CYCLE_ORDER,
  EINK_MODE_STORAGE_KEY,
  type EinkMode,
} from './constants';

export {
  CLASS_1BIT,
  CLASS_EINK,
  CLASS_PAPER,
  DEFAULT_EINK_MODE,
  EINK_MODE_CYCLE_ORDER,
  EINK_MODE_STORAGE_KEY,
  EINK_MODES,
  EINK_MODE_LABELS,
  type EinkMode,
} from './constants';

/** Type guard: is `v` a valid EinkMode string? */
export function isEinkMode(v: unknown): v is EinkMode {
  return v === 'off' || v === 'standard' || v === '1bit' || v === 'paper';
}

/** Read the user's stored preference, with a fallback to
 *  DEFAULT_EINK_MODE. Returns the default if storage is
 *  unavailable (private browsing, quota errors) or the
 *  stored value is invalid. */
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
    // ignore quota / privacy mode errors
  }
}

/** Apply the mode to <html> as a class. Idempotent: calling
 *  applyModeToDom('standard') twice is the same as once. */
export function applyModeToDom(mode: EinkMode): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.classList.toggle(CLASS_EINK, mode !== 'off');
  html.classList.toggle(CLASS_1BIT, mode === '1bit');
  html.classList.toggle(CLASS_PAPER, mode === 'paper');
}

/** Read the current mode by inspecting the classes on <html>.
 *  Used by the keyboard shortcut to determine "where we are
 *  in the cycle". Inverse of applyModeToDom. */
export function readModeFromDom(): EinkMode {
  if (typeof document === 'undefined') return DEFAULT_EINK_MODE;
  const html = document.documentElement;
  if (html.classList.contains(CLASS_1BIT)) return '1bit';
  if (html.classList.contains(CLASS_PAPER)) return 'paper';
  if (html.classList.contains(CLASS_EINK)) return 'standard';
  return 'off';
}

/** Cycle to the next mode in EINK_MODE_CYCLE_ORDER. Wraps. */
export function cycleMode(current: EinkMode): EinkMode {
  const idx = EINK_MODE_CYCLE_ORDER.indexOf(current);
  if (idx === -1) return EINK_MODE_CYCLE_ORDER[0];
  return EINK_MODE_CYCLE_ORDER[(idx + 1) % EINK_MODE_CYCLE_ORDER.length];
}
