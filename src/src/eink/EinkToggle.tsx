// Einkgram — UI toggle for E-Ink mode (v0.14)
//
// Visually identical to other Settings ListItem rows:
//   [icon] Label           <current value>
// Clicking anywhere on the row cycles to the next mode.
// Reachable via Ctrl+Shift+E (init/shortcut.ts) or
// `window.__eink.cycle()` in DevTools.
//
// v0.14: rewrote to match upstream ListItem visual language.
//   - No more black-on-white <button> badge (was visually jarring)
//   - Renders as plain text + value, parent ListItem handles
//     icon / click styling
//
// Green zone: new file, no upstream code touched.

import { useEinkMode } from './useEinkMode';
import { EINK_MODE_LABELS } from './modeApply';
import './EinkToggle.scss';

export const EinkToggle = () => {
  const { mode, cycle } = useEinkMode();

  return (
    <div
      className="eink-toggle"
      role="button"
      tabIndex={0}
      onClick={cycle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cycle();
        }
      }}
      aria-label={`E-Ink mode: ${EINK_MODE_LABELS[mode] ?? 'Standard'}. Click to change.`}
    >
      <span className="eink-toggle__value">{EINK_MODE_LABELS[mode] ?? 'Standard'}</span>
    </div>
  );
};

export default EinkToggle;
