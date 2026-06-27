// Einkgram — Touch page scroll buttons (v0.4.2)
//
// Floating ↑/↓ buttons that appear on the right edge of the screen
// in E-Ink mode. Tap a button to scroll the messages list by 90% of
// its clientHeight. Built for E-Ink touch panels (Boox, Bigme,
// reMarkable) where reaching for a scroll wheel is awkward.
//
// The component is mounted by `init.ts` into a dedicated <div> it
// owns. The div is created on demand, so this component has zero
// effect on the upstream React tree (no App.tsx edit, no
// SettingsMain.tsx edit, no MessageList.tsx edit).
//
// Green zone: pure self-contained component, no upstream imports.

import type { FC } from '../lib/teact/teact';
import { useEffect, useState } from '../lib/teact/teact';
import { usePageScroll } from './usePageScroll';

const PageScrollButtons: FC = () => {
  const { pageScroll, getContainer } = usePageScroll(0.9);
  const [visible, setVisible] = useState(false);

  // The buttons are useful only when the messages container is on
  // screen. We poll lightly to keep the state in sync with chat
  // switches (when the container is unmounted/remounted).
  useEffect(() => {
    function update() {
      setVisible(getContainer() !== null);
    }
    update();
    const t = window.setInterval(update, 1000);
    return () => clearInterval(t);
  }, [getContainer]);

  if (!visible) return null;

  const handleUp = () => pageScroll('up');
  const handleDown = () => pageScroll('down');

  return (
    <div className="eink-page-scroll" aria-label="Page scroll controls">
      <button
        type="button"
        className="eink-page-scroll__btn eink-page-scroll__btn--up"
        onClick={handleUp}
        aria-label="Page up"
        // No onKeyDown handler: this is touch-only by design.
        // Keyboard users use the regular ↑/↓/PgUp/PgDn on desktop.
        tabIndex={-1}
      >
        <span className="eink-page-scroll__arrow" aria-hidden="true">▲</span>
        <span className="eink-page-scroll__label">Up</span>
      </button>
      <button
        type="button"
        className="eink-page-scroll__btn eink-page-scroll__btn--down"
        onClick={handleDown}
        aria-label="Page down"
        tabIndex={-1}
      >
        <span className="eink-page-scroll__arrow" aria-hidden="true">▼</span>
        <span className="eink-page-scroll__label">Down</span>
      </button>
    </div>
  );
};

export default PageScrollButtons;
