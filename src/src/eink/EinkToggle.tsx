// Einkgram — UI toggle for E-Ink mode (v0.15)
//
// v0.15: pure presentational component, no onClick / no role.
//   - Just renders a right-aligned secondary-color value text.
//   - Parent ListItem handles click-to-cycle (calls useEinkMode().cycle).
//
// Green zone: new file, no upstream code touched.

import { useEinkMode } from './useEinkMode';
import { EINK_MODE_LABELS } from './modeApply';
import './EinkToggle.scss';

export const EinkToggle = () => {
  const { mode } = useEinkMode();
  return (
    <span className="eink-toggle__value">{EINK_MODE_LABELS[mode] ?? 'Standard'}</span>
  );
};

export default EinkToggle;
