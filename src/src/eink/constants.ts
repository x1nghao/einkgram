// Einkgram — Shared constants and types (v0.8)
//
// Before v0.8, the same constants (CLASS_EINK, STORAGE_KEY, etc.)
// and types (EinkMode) were duplicated in 3 files. This file is
// the single source of truth.
//
// Green zone: pure type/value exports, no upstream code touched.

/**
 * E-Ink display mode.
 *   'off'       — no E-Ink filter, default Telegram look
 *   'standard'  — 16-level grayscale + slight contrast (most E-Ink)
 *   '1bit'      — pure black/white (Kindle, Boox Go 7, etc)
 *   'paper'     — warm paper look (slight sepia)
 */
export type EinkMode = 'off' | 'standard' | '1bit' | 'paper';

export const EINK_MODES: readonly EinkMode[] = ['off', 'standard', '1bit', 'paper'] as const;

/** Default mode when no preference is stored. */
export const DEFAULT_EINK_MODE: EinkMode = 'standard';

/** Cycle order used by the Ctrl+Shift+E shortcut and the
 *  toggle button. Starts at 'standard' so a fresh user
 *  pressing the shortcut for the first time gets the
 *  standard E-Ink experience, not 'off'. */
export const EINK_MODE_CYCLE_ORDER: readonly EinkMode[] = [
  'standard',
  '1bit',
  'paper',
  'off',
] as const;

/** localStorage key for the user's E-Ink mode preference. */
export const EINK_MODE_STORAGE_KEY = 'eink-mode';

/** HTML class names applied to <html> by `modeApply.ts`. */
export const CLASS_EINK = 'eink-mode';
export const CLASS_1BIT = 'eink-1bit';
export const CLASS_PAPER = 'eink-paper';

/** Human-readable labels for UI surfaces (toggle button,
 *  ARIA labels, banner, etc.). */
export const EINK_MODE_LABELS: Record<EinkMode, string> = {
  off: 'Off',
  standard: '16-Gray',
  '1bit': '1-Bit',
  paper: 'Paper',
};
