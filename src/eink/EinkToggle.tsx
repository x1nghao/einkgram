// Einkgram — UI toggle for E-Ink mode (v0.18)
//
// v0.18: Clickable — cycles ON/OFF when clicked in Settings.
// v0.16: Display-only ON/OFF label.
//
// Green zone: new file, no upstream code touched.

import { EINK_MODE_LABELS } from './modeApply';
import { useEinkMode } from './useEinkMode';

import './EinkToggle.scss';

export const EinkToggle = () => {
  const { mode, cycle } = useEinkMode();
  return (
    <span className="eink-toggle__value" onClick={cycle} role="button" tabIndex={0}>
      {EINK_MODE_LABELS[mode] ?? 'On'}
    </span>
  );
};

export default EinkToggle;
