// Einkgram — UI toggle for E-Ink mode (v0.8)
//
// A small button-group that cycles through off / standard /
// 1bit / paper modes. Reachable via Ctrl+Shift+E (see init/shortcut.ts)
// or `window.__eink.cycle()` in DevTools, or by clicking this button
// (placed in Settings → General in v0.4+).
//
// v0.8 cleanup: labels now come from the shared EINK_MODE_LABELS
// map; component uses function form instead of `FC<>` to match
// the project's preferred style (see AGENTS.md §4).
//
// Green zone: no upstream code touched.

import { useEinkMode } from './useEinkMode';
import { EINK_MODE_LABELS } from './modeApply';
import './EinkToggle.scss';

export const EinkToggle = () => {
  const { mode, cycle } = useEinkMode();

  return (
    <div className="eink-toggle" role="group" aria-label="E-Ink display mode">
      <span className="eink-toggle__label">E-Ink mode</span>
      <button
        type="button"
        className="eink-toggle__btn"
        onClick={cycle}
        aria-label={`Cycle E-Ink mode (current: ${EINK_MODE_LABELS[mode]})`}
      >
        {EINK_MODE_LABELS[mode] ?? 'Standard'}
      </button>
    </div>
  );
};

export default EinkToggle;
