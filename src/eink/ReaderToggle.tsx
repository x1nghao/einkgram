// Einkgram — UI toggle for reader mode (v0.19)
//
// Click cycles ON/OFF. Renders as a compact clickable span.
//
// Green zone: no upstream code touched.

import { READER_MODE_LABELS } from './readerMode';
import { useReaderMode } from './useReaderMode';

import './FontWeightToggle.scss';

export const ReaderToggle = () => {
  const { mode, cycle } = useReaderMode();
  return (
    <span className="eink-toggle__value" onClick={cycle} role="button" tabIndex={0}>
      {READER_MODE_LABELS[mode]}
    </span>
  );
};

export default ReaderToggle;
