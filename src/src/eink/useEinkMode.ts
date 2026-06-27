// Einkgram — E-Ink mode hook (v0.2)
//
// A small React hook that reads/writes the current E-Ink mode
// to `localStorage` and applies/removes the corresponding class
// on `<html>`. Used by `EinkToggle` and `init.ts`.
//
// Modes:
//   'off'       — no E-Ink filter, default Telegram look
//   'standard'  — 16-level grayscale + slight contrast (most E-Ink)
//   '1bit'      — pure black/white (Kindle, Boox Go 7, etc)
//   'paper'     — warm paper look (slight sepia)
//
// Green zone: no upstream code touched.

import { useCallback, useEffect, useState } from '../lib/teact/teact';

export type EinkMode = 'off' | 'standard' | '1bit' | 'paper';

const STORAGE_KEY = 'eink-mode';
const CLASS_EINK = 'eink-mode';
const CLASS_1BIT = 'eink-1bit';
const CLASS_PAPER = 'eink-paper';

function applyModeToDom(mode: EinkMode) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.classList.toggle(CLASS_EINK, mode !== 'off');
  html.classList.toggle(CLASS_1BIT, mode === '1bit');
  html.classList.toggle(CLASS_PAPER, mode === 'paper');
}

function readStoredMode(): EinkMode {
  if (typeof localStorage === 'undefined') return 'standard';
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'off' || v === 'standard' || v === '1bit' || v === 'paper') return v;
  return 'standard';
}

export function useEinkMode() {
  const [mode, setModeState] = useState<EinkMode>(readStoredMode);

  useEffect(() => {
    applyModeToDom(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore quota / privacy mode errors
    }
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
    setModeState((prev) => {
      const order: EinkMode[] = ['standard', '1bit', 'paper', 'off'];
      const idx = order.indexOf(prev);
      return order[(idx + 1) % order.length];
    });
  }, []);

  return { mode, setMode, cycle };
}
