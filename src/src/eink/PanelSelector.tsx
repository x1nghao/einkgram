// Einkgram — UI selector for the E-Ink panel type (v0.14)
//
// Visually identical to other Settings ListItem rows:
//   [icon] Label           <current value>
// Clicking anywhere on the row cycles to the next panel.
// This drives the auto-processor's dithering algorithm
// (1bit / 4gray / 16gray / 256gray / color-4096 / color-30000).
//
// Stored in localStorage as `eink-panel`.
//
// v0.5.5: added a special "auto" option that triggers
// re-detection on every getActivePanel() call. v0.14
// exposes the detected panel as the visible value when
// 'auto' is active.
//
// v0.14: rewrote to match upstream ListItem visual language.
//   - No more <select> with custom chevrons (was getting
//     truncated: "Auto-detect — Let Einkgram figur…")
//   - Just a right-aligned text value, parent ListItem
//     handles icon / click styling
//
// Green zone: new file, no upstream code touched.

import { useCallback, useEffect, useState } from '../lib/teact/teact';
import {
  setActivePanel as persistPanel,
  setActivePanelAuto as persistAuto,
  type PanelType,
} from './panels';
import { detectPanel, clearDetectionCache } from './panelDetect';
import './PanelSelector.scss';

// Order matters: clicking cycles through this list.
const PANEL_CYCLE: PanelType[] = [
  '1bit', '4gray', '16gray', '256gray', 'color-4096', 'color-30000',
];

const PANEL_LABELS: Record<PanelType, string> = {
  '1bit': '1-bit (B/W)',
  '4gray': '4-gray',
  '16gray': '16-gray',
  '256gray': '256-gray',
  'color-4096': 'Color 4096',
  'color-30000': 'Color 30K',
  'unknown': 'Unknown',
};

type StoredValue = PanelType | 'auto';

type Props = {
  initial?: StoredValue;
};

function readStored(): StoredValue {
  try {
    const stored = localStorage.getItem('eink-panel');
    if (stored === 'auto') return 'auto';
    if (stored && stored !== 'unknown' && (PANEL_CYCLE as string[]).includes(stored)) {
      return stored as PanelType;
    }
  } catch {
    // ignore
  }
  return 'auto';
}

export const PanelSelector = ({ initial }: Props) => {
  const [value, setValue] = useState<StoredValue>(initial ?? readStored());
  // Label that the row actually displays.
  // For 'auto', we run detection and show what the detector chose.
  const [displayLabel, setDisplayLabel] = useState<string>('');

  useEffect(() => {
    if (value !== 'auto') {
      setDisplayLabel(PANEL_LABELS[value]);
      return;
    }
    // Run detection (uses cache if warm).
    const v = detectPanel();
    setDisplayLabel(PANEL_LABELS[v]);
  }, [value]);

  const cycle = useCallback(() => {
    const next = (() => {
      if (value === 'auto') {
        // From auto, jump to the first real panel.
        return PANEL_CYCLE[0];
      }
      const idx = PANEL_CYCLE.indexOf(value);
      // At end, wrap back to auto so users can return to detection.
      return PANEL_CYCLE[(idx + 1) % PANEL_CYCLE.length];
    })();
    setValue(next);
    persistPanel(next);
    const w = window as unknown as { __eink?: { setPanel?: (p: PanelType) => void } };
    w.__eink?.setPanel?.(next);
  }, [value]);

  const setAuto = useCallback(() => {
    setValue('auto');
    persistAuto();
    clearDetectionCache();
    const detected = detectPanel();
    const w = window as unknown as { __eink?: { setPanel?: (p: PanelType) => void } };
    w.__eink?.setPanel?.(detected);
    setDisplayLabel(PANEL_LABELS[detected]);
  }, []);

  // Clicking the row cycles; Alt-click returns to auto.
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (e.altKey) {
      setAuto();
    } else {
      cycle();
    }
  }, [cycle, setAuto]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cycle();
    } else if (e.key === 'a' && (e.altKey || e.metaKey)) {
      e.preventDefault();
      setAuto();
    }
  }, [cycle, setAuto]);

  // For accessibility, expose the current effective panel.
  const effective: PanelType = value === 'auto' ? detectPanel() : value;
  const ariaLabel = value === 'auto'
    ? `Display panel: auto-detected ${PANEL_LABELS[effective]}. Click to choose manually.`
    : `Display panel: ${PANEL_LABELS[value]}. Click to change.`;

  return (
    <div
      className="eink-panel-selector"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      <span className="eink-panel-selector__value">
        {value === 'auto' && <span className="eink-panel-selector__auto-tag">Auto</span>}
        {displayLabel}
      </span>
    </div>
  );
};

export default PanelSelector;
