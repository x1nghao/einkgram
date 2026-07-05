// Einkgram — E-Ink mode hook (v0.16)
//
// v0.16: Simplified from 4-mode to ON/OFF toggle. No ramp cache
// invalidation needed (ramp.ts removed). Still uses CustomEvent
// for cross-instance sync.
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

export type { EinkMode } from './modeApply';

export const EINK_MODE_CHANGED_EVENT = 'eink-mode-changed';

export function useEinkMode() {
  const [mode, setModeState] = useState<EinkMode>(readStoredMode);

  useEffect(() => {
    applyModeToDom(mode);
    writeStoredMode(mode);
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
