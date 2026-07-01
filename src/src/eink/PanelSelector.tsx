// Einkgram — UI selector for the E-Ink panel type (v0.15)
//
// v0.15: rewritten to be a pure presentational component.
//   - Just renders a right-aligned secondary-color value text.
//   - Click handling is the parent ListItem's job (via onClick prop).
//   - Reading the stored value + running detection still happens
//     here so the displayed text is always current.
//
// Green zone: new file, no upstream code touched.

import { useEffect, useState } from '../lib/teact/teact';
import { type PanelType } from './panels';
import { detectPanel } from './panelDetect';
import './PanelSelector.scss';

type StoredValue = PanelType | 'auto';

function readStored(): StoredValue {
  try {
    const stored = localStorage.getItem('eink-panel');
    if (stored === 'auto') return 'auto';
    if (stored && stored !== 'unknown' && (
      stored === '1bit' || stored === '4gray' || stored === '16gray' ||
      stored === '256gray' || stored === 'color-4096' || stored === 'color-30000'
    )) {
      return stored as PanelType;
    }
  } catch {
    // ignore
  }
  return 'auto';
}

const PANEL_LABELS: Record<PanelType, string> = {
  '1bit': '1-bit (B/W)',
  '4gray': '4-gray',
  '16gray': '16-gray',
  '256gray': '256-gray',
  'color-4096': 'Color 4096',
  'color-30000': 'Color 30K',
  'unknown': 'Unknown',
};

export const PanelSelector = () => {
  const [value, setValue] = useState<StoredValue>(readStored());
  const [displayLabel, setDisplayLabel] = useState<string>('');

  useEffect(() => {
    if (value !== 'auto') {
      setDisplayLabel(PANEL_LABELS[value]);
      return;
    }
    const v = detectPanel();
    setDisplayLabel(PANEL_LABELS[v]);
  }, [value]);

  // Re-read storage on focus so external cycle actions update the UI.
  useEffect(() => {
    const onFocus = () => setValue(readStored());
    const onChange = () => setValue(readStored());
    window.addEventListener('focus', onFocus);
    window.addEventListener('eink-panel-changed', onChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('eink-panel-changed', onChange);
    };
  }, []);

  return (
    <span className="eink-panel-selector__value">
      {value === 'auto' && <span className="eink-panel-selector__auto-tag">Auto</span>}
      {displayLabel}
    </span>
  );
};

export default PanelSelector;
