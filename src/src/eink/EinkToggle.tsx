// Einkgram — UI toggle for E-Ink mode (v0.2)
//
// A small button-group that cycles through off / standard /
// 1bit / paper modes. Not yet placed in a Settings panel —
// for v0.2 it's reachable via Ctrl+Shift+E (see init.ts)
// or `window.__eink.cycle()` in DevTools.
//
// v0.3 will place this in Settings → General.
//
// Green zone: no upstream code touched.

import type { FC } from '../lib/teact/teact';
import { useEinkMode } from './useEinkMode';
import './EinkToggle.scss';

const LABELS: Record<string, string> = {
  off: 'Off',
  standard: '16-Gray',
  '1bit': '1-Bit',
  paper: 'Paper',
};

export const EinkToggle: FC = () => {
  const { mode, cycle } = useEinkMode();

  return (
    <div className="eink-toggle" role="group" aria-label="E-Ink display mode">
      <span className="eink-toggle__label">E-Ink mode</span>
      <button
        type="button"
        className="eink-toggle__btn"
        onClick={cycle}
        aria-label={`Cycle E-Ink mode (current: ${LABELS[mode]})`}
      >
        {LABELS[mode] ?? 'Standard'}
      </button>
    </div>
  );
};

export default EinkToggle;
