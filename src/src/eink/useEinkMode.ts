// Einkgram — E-Ink mode hook (v0.8: re-exports from modeApply)
//
// v0.8 cleanup: this file used to define its own `EinkMode` type
// and re-implement the DOM/storage helpers. Now it just re-exports
// from `./modeApply` (which itself sources from `./constants`)
// and provides the React hook layer on top.
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

  const setMode = useCallback((next: EinkMode) => {
    setModeState(next);
  }, []);

  const cycle = useCallback(() => {
    setModeState((prev) => cycleMode(prev));
  }, []);

  return { mode, setMode, cycle };
}
