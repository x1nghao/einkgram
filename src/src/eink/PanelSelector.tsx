// Einkgram — UI selector for the E-Ink panel type (v0.5.3)
//
// A small dropdown that lets users pick their device's panel
// type. This drives the auto-processor's dithering algorithm
// (1bit, 4gray, 16gray, 256gray, color-4096, color-30000).
//
// Stored in localStorage as `eink-panel`. The auto-processor
// reads it via `getActivePanel()`.
//
// Green zone: no upstream code touched.

import type { FC } from '../lib/teact/teact';
import { useCallback, useState } from '../lib/teact/teact';
import { setActivePanel as persistPanel, type PanelType } from './panels';
import './PanelSelector.scss';

const OPTIONS: { value: PanelType; label: string; desc: string }[] = [
  { value: '1bit', label: '1-bit (B/W)', desc: 'Kindle, Boox Go 7' },
  { value: '4gray', label: '4-gray', desc: 'Older e-readers' },
  { value: '16gray', label: '16-gray', desc: 'Most BOOX, Bigme' },
  { value: '256gray', label: '256-gray', desc: 'High-end Carta' },
  { value: 'color-4096', label: 'Color 4096', desc: 'Kaleido, Gallery 3' },
  { value: 'color-30000', label: 'Color 30K', desc: 'Latest Gallery 3' },
  { value: 'unknown', label: 'Auto-detect', desc: 'Use device hints' },
];

type Props = {
  initial?: PanelType;
};

export const PanelSelector: FC<Props> = ({ initial }) => {
  // Lazy init from localStorage if not passed in
  const [value, setValue] = useState<PanelType>(() => {
    if (initial) return initial;
    try {
      const stored = localStorage.getItem('eink-panel');
      if (stored) return stored as PanelType;
    } catch {
      // ignore
    }
    return '16gray';
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as PanelType;
    setValue(next);
    persistPanel(next);
    // Update the auto-processor's panel type immediately
    const w = window as unknown as { __eink?: { setPanel?: (p: PanelType) => void } };
    w.__eink?.setPanel?.(next);
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
    </div>
  );
};

export default PanelSelector;
