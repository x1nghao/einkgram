// Einkgram — Initial mode application (v0.8: re-exports from modeApply)
//
// v0.8 cleanup: this file used to define its own `EinkMode` type
// and re-implement the DOM helpers. Now it just re-exports from
// `./modeApply` and provides the boot-time `applyInitialMode()`
// function used by init.ts.
//
// Green zone: no upstream code touched.

import { applyModeToDom, readStoredMode, type EinkMode } from '../modeApply';

export { type EinkMode } from '../modeApply';

/** Read the stored E-Ink mode and apply it to <html> as early
 *  as possible. Runs before main.tsx so the first paint already
 *  has the right class on the root element. */
export function applyInitialMode(): void {
  applyModeToDom(readStoredMode());
}
