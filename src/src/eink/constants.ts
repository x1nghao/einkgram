// Einkgram — Shared constants and types (v0.16)
//
// v0.16: Simplified from 4-mode (off/standard/1bit/paper) to a
// single ON/OFF toggle. CSS filters and JS dithering are removed
// — the E-Ink device driver handles grayscale mapping. What we
// keep: animation suppression, high-contrast focus ring, visual
// noise removal (wallpapers, patterns).
//
// Green zone: pure type/value exports, no upstream code touched.

/**
 * E-Ink mode: enabled or disabled.
 * When enabled, styles in _reset.scss suppress animations,
 * transitions, custom backgrounds, and smooth scroll — all of
 * which cause ghosting / performance issues on E-Ink panels.
 * No CSS filter or JS dithering is applied; the device driver
 * handles all grayscale/palette conversion.
 */
export type EinkMode = 'off' | 'on';

export const DEFAULT_EINK_MODE: EinkMode = 'on';

/** localStorage key for the user's E-Ink mode preference. */
export const EINK_MODE_STORAGE_KEY = 'eink-mode';

/** HTML class name applied to <html> by modeApply.ts. */
export const CLASS_EINK = 'eink-mode';

/** Human-readable labels for UI surfaces. */
export const EINK_MODE_LABELS: Record<EinkMode, string> = {
  off: 'Off',
  on: 'On',
};

/** Cycle order used by the Ctrl+Shift+E shortcut. */
export const EINK_MODE_CYCLE_ORDER: readonly EinkMode[] = ['off', 'on'] as const;

// ════════════════════════════════════════════════════════
// Font weight — independent from ON/OFF toggle.
// Applied via data-eink-font-weight on <html>, consumed by
// _reset.scss. Three levels: normal (no-op), medium (500),
// bold (600). Storage+DOM kept separate from modeApply.
// ════════════════════════════════════════════════════════

/** Font weight level for E-Ink readability. */
export type FontWeightLevel = 'normal' | 'medium' | 'bold';

export const DEFAULT_FONT_WEIGHT: FontWeightLevel = 'normal';

/** localStorage key for font weight preference. */
export const FONT_WEIGHT_STORAGE_KEY = 'eink-font-weight';

/** data-* attribute applied to <html> by fontWeight.ts. */
export const FONT_WEIGHT_ATTR = 'data-eink-font-weight';

/** Human-readable labels for UI surfaces. */
export const FONT_WEIGHT_LABELS: Record<FontWeightLevel, string> = {
  normal: 'Normal',
  medium: 'Medium',
  bold: 'Bold',
};

/** Cycle order — click cycles normal→medium→bold→normal. */
export const FONT_WEIGHT_CYCLE: readonly FontWeightLevel[] = [
  'normal',
  'medium',
  'bold',
] as const;
