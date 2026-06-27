// Einkgram — Initial mode application (extracted from init.ts in v0.5.4)
//
// Reads the stored E-Ink mode from localStorage and applies the
// corresponding class to <html> as early as possible. This runs
// before main.tsx so the first paint already has the right
// class on the root element.

export type EinkMode = 'off' | 'standard' | '1bit' | 'paper';

const STORAGE_KEY = 'eink-mode';
const CLASS_EINK = 'eink-mode';
const CLASS_1BIT = 'eink-1bit';
const CLASS_PAPER = 'eink-paper';

function isMode(v: string | null): v is EinkMode {
  return v === 'off' || v === 'standard' || v === '1bit' || v === 'paper';
}

export function applyInitialMode(): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  let mode: EinkMode = 'standard';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isMode(stored)) mode = stored;
  } catch {
    // ignore quota / privacy mode errors
  }
  html.classList.toggle(CLASS_EINK, mode !== 'off');
  html.classList.toggle(CLASS_1BIT, mode === '1bit');
  html.classList.toggle(CLASS_PAPER, mode === 'paper');
}
