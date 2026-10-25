// Einkgram — Reader mode hook (v0.19)
//
// Same pattern as useFontWeight: useState + CustomEvent sync.
//
// Green zone: no upstream code touched.

import { useCallback, useEffect, useState } from '../lib/teact/teact';

import type { ReaderMode } from './readerMode';

import {
  applyReaderModeToDom,
  cycleReaderMode,
  readStoredReaderMode,
  writeStoredReaderMode,
} from './readerMode';

export type { ReaderMode } from './readerMode';

export const READER_MODE_CHANGED_EVENT = 'eink-reader-mode-changed';

export function useReaderMode() {
  const [mode, setMode] = useState<ReaderMode>(readStoredReaderMode);

  useEffect(() => {
    applyReaderModeToDom(mode);
    writeStoredReaderMode(mode);
  }, [mode]);

  useEffect(() => {
    const onChange = () => setMode(readStoredReaderMode());
    window.addEventListener(READER_MODE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(READER_MODE_CHANGED_EVENT, onChange);
  }, []);

  const updateMode = useCallback((next: ReaderMode) => {
    setMode(next);
    window.dispatchEvent(new CustomEvent(READER_MODE_CHANGED_EVENT));
  }, []);

  const cycle = useCallback(() => {
    setMode((prev) => cycleReaderMode(prev));
    window.dispatchEvent(new CustomEvent(READER_MODE_CHANGED_EVENT));
  }, []);

  return { mode, setMode: updateMode, cycle } as const;
}
