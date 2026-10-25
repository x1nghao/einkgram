// Einkgram — UI toggle for font weight (v0.18)
//
// Three-level cycle on click: Normal → Medium → Bold → Normal.
// Renders as a compact clickable span showing current level.
//
// Green zone: new file, no upstream code touched.

import { FONT_WEIGHT_LABELS } from './constants';
import { useFontWeight } from './useFontWeight';

import './FontWeightToggle.scss';

export const FontWeightToggle = () => {
  const { level, cycle } = useFontWeight();
  return (
    <span className="eink-toggle__value" onClick={cycle} role="button" tabIndex={0}>
      {FONT_WEIGHT_LABELS[level]}
    </span>
  );
};

export default FontWeightToggle;
