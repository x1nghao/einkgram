// Einkgram — Keyboard shortcut for E-Ink mode cycling (extracted v0.5.4)
//
// Registers a global Ctrl+Shift+E (or Cmd+Shift+E) shortcut to
// cycle through the E-Ink modes: standard → 1bit → paper → off → standard.
//
// We can't use the hook here (not a component), so we
// re-implement the cycle logic against the DOM directly.

import type { EinkMode } from './mode';

const ORDER: EinkMode[] = ['standard', '1bit', 'paper', 'off'];
const STORAGE_KEY = 'eink-mode';
const CLASS_EINK = 'eink-mode';
const CLASS_1BIT = 'eink-1bit';
const CLASS_PAPER = 'eink-paper';

function currentFromDom(): EinkMode {
  const html = document.documentElement;
  if (html.classList.contains(CLASS_1BIT)) return '1bit';
  if (html.classList.contains(CLASS_PAPER)) return 'paper';
  if (html.classList.contains(CLASS_EINK)) return 'standard';
  return 'off';
}

function setMode(mode: EinkMode): void {
  const html = document.documentElement;
  html.classList.toggle(CLASS_EINK, mode !== 'off');
  html.classList.toggle(CLASS_1BIT, mode === '1bit');
  html.classList.toggle(CLASS_PAPER, mode === 'paper');
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore quota / privacy mode errors
  }
}

export type ShortcutApi = {
  setMode: (mode: EinkMode) => void;
  currentFromDom: () => EinkMode;
  cycle: () => EinkMode;
};

export function registerShortcut(): ShortcutApi {
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      const cur = currentFromDom();
      const idx = ORDER.indexOf(cur);
      setMode(ORDER[(idx + 1) % ORDER.length]);
    }
  });

  return {
    setMode,
    currentFromDom,
    cycle(): EinkMode {
      const cur = currentFromDom();
      const idx = ORDER.indexOf(cur);
      const next = ORDER[(idx + 1) % ORDER.length];
      setMode(next);
      return next;
    },
  };
}
