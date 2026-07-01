// Einkgram — E-Ink mode hook (v0.15)
//
// v0.8 cleanup: this file used to define its own `EinkMode` type
// and re-implement the DOM/storage helpers. Now it just re-exports
// from `./modeApply` (which itself sources from `./constants`)
// and provides the React hook layer on top.
//
// v0.15: multiple components in the same render tree each
// call useEinkMode() and get independent useState. To keep
// them in sync, every mutation dispatches an 'eink-mode-changed'
// CustomEvent on window. Other useEinkMode instances listen
// and re-read from localStorage.
//
// Green zone: no upstream code touched.

import { useCallback, useEffect, useState } from '../lib/teact/teact';
import {
  applyModeToDom,
  cycleMode,
  readStoredMode,
  writeStoredMode,
  type EinkMode,
} from './modeApply';

// Re-export so existing callers (`import { EinkMode } from
// './useEinkMode'`) keep working without modification.
export type { EinkMode } from './modeApply';

export const EINK_MODE_CHANGED_EVENT = 'eink-mode-changed';

export function useEinkMode() {
  const [mode, setModeState] = useState<EinkMode>(readStoredMode);

  useEffect(() => {
    applyModeToDom(mode);
    writeStoredMode(mode);
    // v0.7: invalidate the ramp cache when eink mode changes
    // (the --eink-ramp-* CSS variables may differ between
    // 1bit / paper / standard variants).
    void import('./ramp').then((m) => m.clearRampCache()).catch(() => {
      // ramp.ts may not be available in some test contexts;
      // the cache is best-effort.
    });
  }, [mode]);

  // Sync with other useEinkMode instances in the same tree.
  useEffect(() => {
    const onChange = () => setModeState(readStoredMode());
    window.addEventListener(EINK_MODE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(EINK_MODE_CHANGED_EVENT, onChange);
  }, []);

  const setMode = useCallback((next: EinkMode) => {
    setModeState(next);
    window.dispatchEvent(new CustomEvent(EINK_MODE_CHANGED_EVENT));
  }, []);

  const cycle = useCallback(() => {
    setModeState((prev) => cycleMode(prev));
    window.dispatchEvent(new CustomEvent(EINK_MODE_CHANGED_EVENT));
  }, []);

  return { mode, setMode, cycle };
}
