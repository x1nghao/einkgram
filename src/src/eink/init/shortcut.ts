// Einkgram — Keyboard shortcut for E-Ink mode cycling (v0.8)
//
// v0.8 cleanup: this file used to define its own mode constants
// and re-implement currentFromDom / setMode. Now it just wires
// up the global keydown listener and delegates to ./modeApply.
//
// Green zone: no upstream code touched.

import {
  applyModeToDom,
  cycleMode,
  readModeFromDom,
  writeStoredMode,
  type EinkMode,
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
