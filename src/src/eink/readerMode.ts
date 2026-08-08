// Einkgram — Reader mode (v0.19)
//
// A reading-optimized layout for E-Ink devices, especially
// large-screen devices (10.3"+). When enabled:
//   - Message bubbles expand to full width
//   - Avatars shrink to 24px or hide
//   - Message spacing increases
//   - Timestamps move below messages
//   - Default font size increases to 20px
//
// CSS is in _reset.scss under [data-eink-reader="on"].
// Storage + DOM pattern mirrors fontWeight.ts.
//
// Green zone: no upstream code touched.

import {
  DEFAULT_READER_MODE,
  READER_MODE_ATTR,
  READER_MODE_CYCLE,
  READER_MODE_LABELS,
  READER_MODE_STORAGE_KEY,
  type ReaderMode,
} from './constants';

export type { ReaderMode } from './constants';

/** Type guard. */
export function isReaderMode(v: unknown): v is ReaderMode {
  return v === 'off' || v === 'on';
}

/** Read stored preference, falling back to default. */
export function readStoredReaderMode(): ReaderMode {
  if (typeof localStorage === 'undefined') return DEFAULT_READER_MODE;
  try {
    const v = localStorage.getItem(READER_MODE_STORAGE_KEY);
    if (isReaderMode(v)) return v;
  } catch {
    // ignore
  }
  return DEFAULT_READER_MODE;
}

/** Persist preference. Silent on errors. */
export function writeStoredReaderMode(mode: ReaderMode): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(READER_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

/** Apply reader mode to <html> via data attribute. */
export function applyReaderModeToDom(mode: ReaderMode): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (mode === 'on') {
    html.setAttribute(READER_MODE_ATTR, 'on');
  } else {
    html.removeAttribute(READER_MODE_ATTR);
  }
}

/** Read current mode from <html> data attribute. */
export function readReaderModeFromDom(): ReaderMode {
  if (typeof document === 'undefined') return DEFAULT_READER_MODE;
  return document.documentElement.getAttribute(READER_MODE_ATTR) === 'on'
    ? 'on'
    : 'off';
}

/** Cycle to next mode. Wraps. */
export function cycleReaderMode(current: ReaderMode): ReaderMode {
  const idx = READER_MODE_CYCLE.indexOf(current);
  if (idx === -1) return READER_MODE_CYCLE[0];
  return READER_MODE_CYCLE[(idx + 1) % READER_MODE_CYCLE.length];
}

/** Apply stored mode on first paint (called from init.ts). */
export function applyInitialReaderMode(): void {
  applyReaderModeToDom(readStoredReaderMode());
}

// Re-export labels for UI.
export { READER_MODE_LABELS };
