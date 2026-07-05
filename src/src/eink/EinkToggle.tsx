// Einkgram — UI toggle for E-Ink mode (v0.16)
//
// v0.16: Simplified to ON/OFF toggle. Pure presentational
// component rendered inside <ListItem rightElement={...}>.
//
// Green zone: new file, no upstream code touched.

import { useEinkMode } from './useEinkMode';
import { EINK_MODE_LABELS } from './modeApply';
import './EinkToggle.scss';

export const EinkToggle = () => {
  const { mode } = useEinkMode();
  return (
    <span className="eink-toggle__value">{EINK_MODE_LABELS[mode] ?? 'On'}</span>
  );
};

export default EinkToggle;
