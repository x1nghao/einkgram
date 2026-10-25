// Einkgram — Initial mode application (v0.16)
//
// Reads the stored E-Ink mode and applies the eink-mode class
// to <html> as early as possible, before the first paint.
//
// Green zone: no upstream code touched.

import { applyModeToDom, readStoredMode } from '../modeApply';

export { type EinkMode } from '../modeApply';

/** Apply the stored mode to <html>. Called from init.ts before
 *  main.tsx runs, so the first paint already has the right
 *  class on the root element. */
export function applyInitialMode(): void {
  applyModeToDom(readStoredMode());
}
