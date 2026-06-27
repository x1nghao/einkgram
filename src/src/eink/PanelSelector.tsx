// Einkgram — UI selector for the E-Ink panel type (v0.5.3 + v0.5.5)
//
// A small dropdown that lets users pick their device's panel
// type. This drives the auto-processor's dithering algorithm
// (1bit, 4gray, 16gray, 256gray, color-4096, color-30000).
//
// Stored in localStorage as `eink-panel`. The auto-processor
// reads it via `getActivePanel()`.
//
// v0.5.5: added a special "auto" option (stored as the literal
// string 'auto' in localStorage) that triggers re-detection
// on every call. When the user picks "auto" we display the
// detected panel in a read-only caption so they can see what
// was chosen.
//
// Green zone: no upstream code touched.

import type { ChangeEvent } from 'react';
import type { FC } from '../lib/teact/teact';
import { useCallback, useEffect, useState } from '../lib/teact/teact';
import {
  setActivePanel as persistPanel,
  setActivePanelAuto as persistAuto,
  type PanelType,
} from './panels';
import { detectPanel, clearDetectionCache } from './panelDetect';
import './PanelSelector.scss';

// 'auto' is a special UI value that triggers detection.
// It's not a valid PanelType, so we use a wider type for
// the select state.
type SelectValue = PanelType | 'auto';

const OPTIONS: { value: SelectValue; label: string; desc: string }[] = [
  { value: 'auto', label: 'Auto-detect', desc: 'Let Einkgram figure it out' },
  { value: '1bit', label: '1-bit (B/W)', desc: 'Kindle, Boox Go 7' },
  { value: '4gray', label: '4-gray', desc: 'Older e-readers' },
  { value: '16gray', label: '16-gray', desc: 'Most BOOX, Bigme' },
  { value: '256gray', label: '256-gray', desc: 'High-end Carta' },
  { value: 'color-4096', label: 'Color 4096', desc: 'Kaleido, Gallery 3' },
  { value: 'color-30000', label: 'Color 30K', desc: 'Latest Gallery 3' },
];

type Props = {
  initial?: PanelType | 'auto';
};

export const PanelSelector: FC<Props> = ({ initial }) => {
  // Lazy init from localStorage if not passed in.
  // The localStorage value 'auto' (string) becomes the
  // SelectValue 'auto'.
  const [value, setValue] = useState<SelectValue>(() => {
    if (initial) return initial;
    try {
      const stored = localStorage.getItem('eink-panel');
      if (stored === 'auto') return 'auto';
      if (stored && stored !== 'unknown') return stored as PanelType;
    } catch {
      // ignore
    }
    return 'auto'; // Default to auto-detect for new users
  });

  // When in 'auto' mode, display the detected panel as a caption.
  const [detectedLabel, setDetectedLabel] = useState<string>('');

  useEffect(() => {
    if (value !== 'auto') {
      setDetectedLabel('');
      return;
    }
    // Run detection (uses cache if warm).
    const v = detectPanel();
    const opt = OPTIONS.find((o) => o.value === v);
    setDetectedLabel(opt ? opt.label : 'Unknown (default 16-gray)');
  }, [value]);

  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as SelectValue;
    setValue(next);
    if (next === 'auto') {
      persistAuto();
      // Clear detection cache so the next getActivePanel() call
      // re-runs the strategies with fresh state.
      clearDetectionCache();
      // Update the auto-processor to use whatever detection finds.
      const detected = detectPanel();
      const w = window as unknown as {
        __eink?: { setPanel?: (p: PanelType) => void };
      };
      w.__eink?.setPanel?.(detected);
      // Refresh the caption.
      const opt = OPTIONS.find((o) => o.value === detected);
      setDetectedLabel(opt ? opt.label : 'Unknown (default 16-gray)');
    } else {
      persistPanel(next);
      // Update the auto-processor's panel type immediately.
      const w = window as unknown as {
        __eink?: { setPanel?: (p: PanelType) => void };
      };
      w.__eink?.setPanel?.(next);
    }
  }, []);

  return (
    <div className="eink-panel-selector" role="group" aria-label="E-Ink panel type">
      <span className="eink-panel-selector__label">Display panel</span>
      <select
        className="eink-panel-selector__select"
        value={value}
        onChange={handleChange}
        aria-label="Select E-Ink panel type"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} — {o.desc}
          </option>
        ))}
      </select>
      {value === 'auto' && detectedLabel && (
        <span className="eink-panel-selector__detected" aria-live="polite">
          Detected: <strong>{detectedLabel}</strong>
        </span>
      )}
    </div>
  );
};

export default PanelSelector;
