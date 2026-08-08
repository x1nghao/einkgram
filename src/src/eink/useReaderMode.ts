// Einkgram — Reader mode hook (v0.19)
//
// Same pattern as useFontWeight: useState + CustomEvent sync.
//
// Green zone: no upstream code touched.

import { useCallback, useEffect, useState } from '../lib/teact/teact';
import {
  applyReaderModeToDom,
  cycleReaderMode,
  readStoredReaderMode,
  writeStoredReaderMode,
} from './readerMode';
import type { ReaderMode } from './readerMode';

export type { ReaderMode } from './readerMode';

export const READER_MODE_CHANGED_EVENT = 'eink-reader-mode-changed';

export function useReaderMode() {
  const [mode, setModeState] = useState<ReaderMode>(readStoredReaderMode);

  useEffect(() => {
    applyReaderModeToDom(mode);
    writeStoredReaderMode(mode);
  }, [mode]);

  useEffect(() => {
    const onChange = () => setModeState(readStoredReaderMode());
    window.addEventListener(READER_MODE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(READER_MODE_CHANGED_EVENT, onChange);
  }, []);

  const setMode = useCallback((next: ReaderMode) => {
    setModeState(next);
    window.dispatchEvent(new CustomEvent(READER_MODE_CHANGED_EVENT));
  }, []);

  const cycle = useCallback(() => {
    setModeState((prev) => cycleReaderMode(prev));
    window.dispatchEvent(new CustomEvent(READER_MODE_CHANGED_EVENT));
  }, []);

  return { mode, setMode, cycle } as const;
}
