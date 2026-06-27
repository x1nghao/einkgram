// Einkgram — E-Ink panel type detection (v0.4)
//
// Different E-Ink panels need different image processing:
//   - 1-bit (Kindle, Boox Go 7 in B&W mode)         → threshold dither
//   - 4-gray (older E-Ink, low-cost panels)         → 4-level FS dither
//   - 16-gray (Carta, most modern E-Ink)            → 16-level FS dither
//   - 256-gray (high-end Carta HD)                  → minimal S-curve only
//   - color-4096 (Kaleido, Gallery 3 with 4096 colors) → median cut quantize
//   - color-30000 (Gallery 3 advanced, ACeP)        → median cut quantize
//
// In v0.3 we hardcoded 16-gray Floyd-Steinberg. v0.4 makes the
// choice data-driven so that:
//   - 1-bit panels don't waste 4x memory on 16 levels
//   - Color panels (Kaleido) keep their color (no grayscale filter!)
//   - The algorithm can be swapped (FS / Atkinson / Stucki) per panel
//
// v0.5.5 adds auto-detection: when the user hasn't picked a panel
// from Settings, we run heuristics (UA, CSS monochrome media query,
// screen color depth, touch-only) to guess. See panelDetect.ts.
//
// Green zone: pure utility module, no upstream touched.

import { detectPanel } from './panelDetect';

export type PanelType =
  | '1bit'
  | '4gray'
  | '16gray'
  | '256gray'
  | 'color-4096'
  | 'color-30000'
  | 'unknown';

/**
 * Read the panel type from a CSS custom property `--eink-panel-type`
 * set by the bootstrap (v0.4.1 will set this from UA sniff).
 * Falls back to `'unknown'` if not set.
 */
export function readPanelFromCss(): PanelType {
  if (typeof document === 'undefined') return 'unknown';
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--eink-panel-type')
    .trim()
    .toLowerCase();
  return isPanelType(v) ? v : 'unknown';
}

/**
 * Read the panel from the active E-Ink mode (a coarser hint).
 * Maps the user-facing mode to a default panel type:
 *   '1bit'    → '1bit'
 *   'paper'   → '16gray' (sepia, but still gray)
 *   'standard' → '16gray'
 *   'off'     → 'unknown'
 */
export function panelFromMode(mode: string): PanelType {
  switch (mode) {
    case '1bit':
      return '1bit';
    case 'paper':
    case 'standard':
      return '16gray';
    default:
      return 'unknown';
  }
}

function isPanelType(v: string): v is PanelType {
  return (
    v === '1bit' ||
    v === '4gray' ||
    v === '16gray' ||
    v === '256gray' ||
    v === 'color-4096' ||
    v === 'color-30000' ||
    v === 'unknown'
  );
}

export { isPanelType };

/**
 * Recommended dithering algorithm for a given panel.
 * Returns the algorithm name; the image processor dispatches on this.
 */
export type DitherAlgorithm =
  | 'floyd-steinberg' // default, works for 4/16/256 gray
  | 'atkinson' // softer, used by classic Mac
  | 'stucki' // 12-level, smoother gradients
  | 'threshold' // 1-bit, no dither
  | 'median-cut'; // color quantize

export function recommendAlgorithm(panel: PanelType): DitherAlgorithm {
  switch (panel) {
    case '1bit':
      return 'threshold';
    case '4gray':
    case '16gray':
      return 'floyd-steinberg';
    case '256gray':
      return 'floyd-steinberg'; // minimal levels matter less
    case 'color-4096':
    case 'color-30000':
      return 'median-cut';
    default:
      return 'floyd-steinberg';
  }
}

/**
 * Recommended number of quantization levels per panel.
 * (For color panels this is the palette size, not gray levels.)
 */
export function recommendLevels(panel: PanelType): number {
  switch (panel) {
    case '1bit':
      return 2;
    case '4gray':
      return 4;
    case '16gray':
      return 16;
    case '256gray':
      return 256;
    case 'color-4096':
      return 4096;
    case 'color-30000':
      return 30000;
    default:
      return 16;
  }
}

/**
 * Should the panel preserve color or be desaturated to grayscale?
 * Color panels (Kaleido, Gallery 3) keep color; gray panels don't.
 */
export function panelIsColor(panel: PanelType): boolean {
  return panel === 'color-4096' || panel === 'color-30000';
}

/**
 * Human-readable description for the Settings UI.
 */
export const PANEL_DESCRIPTIONS: Record<PanelType, string> = {
  '1bit': 'Pure black & white (Kindle, Boox Go 7 B&W mode)',
  '4gray': '4-level grayscale (older E-Ink)',
  '16gray': '16-level grayscale (Carta, most modern E-Ink)',
  '256gray': '256-level grayscale (Carta HD, minimal processing)',
  'color-4096': '4,096 colors (Kaleido, Gallery 3)',
  'color-30000': '30,000+ colors (Gallery 3 advanced, ACeP)',
  unknown: 'Unknown — defaulting to 16-level grayscale',
};

// ─────────────────────────────────────────────────────────
// Persistent active panel (v0.5)
//
// Stored in localStorage; used by the auto-processor to know
// which algorithm to apply. If the user picks a panel from
// Settings, it persists across reloads.
// ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'eink-panel';

export const ALL_PANEL_TYPES: PanelType[] = [
  '1bit', '4gray', '16gray', '256gray', 'color-4096', 'color-30000',
];

/**
 * Get the currently active panel.
 * Reads from localStorage first, falls back to auto-detection,
 * then to CSS, then to a safe default.
 *
 * Note: if localStorage holds the literal string 'auto', we
 * treat that as "user has opted out of a manual pick" and
 * run auto-detection on every call (no caching in localStorage).
 */
export function getActivePanel(): PanelType {
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'auto') {
        // User wants auto-detection. Run the heuristics.
        return detectPanel();
      }
      if (stored && isPanelType(stored)) return stored;
    } catch {
      // localStorage might be blocked; fall through.
    }
  }
  // No manual pick: try auto-detect first (it's more accurate
  // than the CSS var fallback in v0.5.4 and earlier).
  const detected = detectPanel();
  if (detected !== 'unknown') return detected;
  const fromCss = readPanelFromCss();
  if (fromCss !== 'unknown') return fromCss;
  return '16gray'; // safe default for Einkgram
}

/**
 * Set the active panel to a user-picked value. Persists to
 * localStorage. The value must be a valid PanelType.
 */
export function setActivePanel(panel: PanelType): void {
  try {
    localStorage.setItem(STORAGE_KEY, panel);
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--eink-panel-type', panel);
  }
}

/**
 * Set the active panel to "auto-detect" mode. Persists 'auto'
 * to localStorage so subsequent getActivePanel() calls will
 * run detection again. Also clears the detection cache so
 * the next call returns a fresh answer.
 */
export function setActivePanelAuto(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'auto');
  } catch {
    // ignore
  }
  // Clear the cached detection so the next getActivePanel() call
  // re-runs the strategies.
  // Lazy import to avoid a circular dep.
  import('./panelDetect').then((m) => m.clearDetectionCache()).catch(() => {});
  if (typeof document !== 'undefined') {
    // Mark in CSS that we're in auto mode.
    document.documentElement.style.setProperty('--eink-panel-type', 'auto');
  }
}
