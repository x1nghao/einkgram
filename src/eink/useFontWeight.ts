// Einkgram — Font weight hook (v0.18)
//
// Independent from useEinkMode. Cycles normal→medium→bold.
// Uses CustomEvent for cross-instance sync (same pattern as
// useEinkMode).
//
// Green zone: no upstream code touched.

import { useCallback, useEffect, useState } from '../lib/teact/teact';

import {
  applyFontWeightToDom,
  cycleFontWeight,
  type FontWeightLevel,
  readStoredFontWeight,
  writeStoredFontWeight,
} from './fontWeight';

export type { FontWeightLevel } from './fontWeight';

export const FONT_WEIGHT_CHANGED_EVENT = 'eink-font-weight-changed';

export function useFontWeight() {
  const [level, setLevel] = useState<FontWeightLevel>(readStoredFontWeight);

  useEffect(() => {
    applyFontWeightToDom(level);
    writeStoredFontWeight(level);
  }, [level]);

  // Sync with other useFontWeight instances in the same tree.
  useEffect(() => {
    const onChange = () => setLevel(readStoredFontWeight());
    window.addEventListener(FONT_WEIGHT_CHANGED_EVENT, onChange);
    return () =>
      window.removeEventListener(FONT_WEIGHT_CHANGED_EVENT, onChange);
  }, []);

  const updateLevel = useCallback((next: FontWeightLevel) => {
    setLevel(next);
    window.dispatchEvent(new CustomEvent(FONT_WEIGHT_CHANGED_EVENT));
  }, []);

  const cycle = useCallback(() => {
    setLevel((prev) => cycleFontWeight(prev));
    window.dispatchEvent(new CustomEvent(FONT_WEIGHT_CHANGED_EVENT));
  }, []);

  return { level, setLevel: updateLevel, cycle } as const;
}
