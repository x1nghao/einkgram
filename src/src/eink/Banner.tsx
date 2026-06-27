// Einkgram — First-switch banner (v0.3)
//
// Shows a non-dismissible-toast style banner the first time the user
// switches E-Ink mode (and on first load if no localStorage entry).
// Offers:
//   - Quick action: cycle to next mode
//   - "Don't show again" — stores `eink-banner-dismissed=1`
//
// v0.3 leaves this as a self-contained React component; it's not yet
// placed in the Settings tree (red zone). v0.4 will mount it from
// App.tsx (1 line import + 1 line JSX, same red-zone cost as the
// EinkToggle wiring).
//
// Green zone: no upstream code touched.

import type { FC } from '../lib/teact/teact';
import { useEffect, useState } from '../lib/teact/teact';
import { useEinkMode } from './useEinkMode';

const BANNER_KEY = 'eink-banner-dismissed';
const SHOW_ON_FIRST_LOAD_KEY = 'eink-mode'; // already used by useEinkMode

const TIPS: Record<string, string> = {
  off: 'E-Ink filters off — back to full-color UI.',
  standard: '16-level grayscale + slight contrast. Best for most E-Ink panels.',
  '1bit': '1-bit pure black & white. Best for Kindle and Boox Go 7.',
  paper: 'Warm paper look with slight sepia. For RGB tablets emulating E-Ink.',
};

export const EinkBanner: FC = () => {
  const { mode, cycle } = useEinkMode();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const wasDismissed = localStorage.getItem(BANNER_KEY) === '1';
    const hasSeen = localStorage.getItem(SHOW_ON_FIRST_LOAD_KEY) !== null;
    // Show only if not previously dismissed AND user is new
    setDismissed(wasDismissed);
    setVisible(!wasDismissed && !hasSeen);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleCycleAndDismiss = () => {
    cycle();
    handleDismiss();
  };

  if (dismissed || !visible) return null;

  return (
    <div className="eink-banner" role="status" aria-live="polite">
      <div className="eink-banner__body">
        <strong>Einkgram</strong>
        <span>{TIPS[mode] ?? 'E-Ink mode is active.'}</span>
      </div>
      <div className="eink-banner__actions">
        <button
          type="button"
          className="eink-banner__btn"
          onClick={handleCycleAndDismiss}
        >
          Try {nextModeLabel(mode)}
        </button>
        <button
          type="button"
          className="eink-banner__btn eink-banner__btn--quiet"
          onClick={handleDismiss}
        >
          Don't show again
        </button>
      </div>
    </div>
  );
};

function nextModeLabel(current: string): string {
  const order = ['standard', '1bit', 'paper', 'off'];
  const idx = order.indexOf(current);
  const next = order[(idx + 1) % order.length];
  return LABELS[next] ?? 'next mode';
}

const LABELS: Record<string, string> = {
  off: 'Off',
  standard: '16-Gray',
  '1bit': '1-Bit',
  paper: 'Paper',
};

export default EinkBanner;
