// Einkgram — Keyboard shortcut for E-Ink mode cycling (v0.16)
//
// Ctrl+Shift+E toggles E-Ink mode on/off.
//
// Green zone: no upstream code touched.

import {
  applyModeToDom,
  cycleMode,
  type EinkMode,
  readModeFromDom,
  writeStoredMode,
} from '../modeApply';

export type ShortcutApi = {
  setMode: (mode: EinkMode) => void;
  currentFromDom: () => EinkMode;
  cycle: () => EinkMode;
};

function setMode(mode: EinkMode): void {
  applyModeToDom(mode);
  writeStoredMode(mode);
}

export function registerShortcut(): ShortcutApi {
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      const cur = readModeFromDom();
      setMode(cycleMode(cur));
    }
  });

  return {
    setMode,
    currentFromDom: readModeFromDom,
    cycle(): EinkMode {
      const cur = readModeFromDom();
      const next = cycleMode(cur);
      setMode(next);
      return next;
    },
  };
}
