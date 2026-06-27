// Einkgram — E-Ink friendly loading screen (v0.9)
//
// The default Telegram loading screen is a rotating circle on a
// dark background. For E-Ink devices this is the worst possible
// animation: it triggers a full-panel partial refresh every
// 16ms (60fps × several rotations).
//
// This component replaces it with a static "Loading Einkgram…"
// text and a 25%-filled progress bar that holds steady until
// the parent re-renders and unmounts it. **Zero repaints** on
// E-Ink during the boot — the user sees the bar at the same
// state for the entire boot, then the real UI replaces it.
//
// `progress` is optional. If provided, the fill width matches.
// If not, the bar is filled at 25% (one static repaint: the
// initial paint).
//
// Green zone: no upstream code touched.

import './Loading.scss';

type Props = {
  /** 0..1; if undefined, bar is filled at 25% (static) */
  progress?: number;
  /** Label shown above the bar (default "Loading Einkgram…") */
  label?: string;
};

export const EinkLoading = ({ progress, label = 'Loading Einkgram…' }: Props) => {
  const pct = progress !== undefined
    ? Math.max(0, Math.min(1, progress)) * 100
    : 25; // static 25% when progress is unknown

  return (
    <div className="eink-loading" role="status" aria-live="polite">
      <div className="eink-loading__label">{label}</div>
      <div
        className="eink-loading__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className="eink-loading__fill"
          // Teact's style prop type is loose; use `as any` to
          // keep the type of `width: '${pct}%'` from being
          // wrongly inferred as a string method.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={{ width: `${pct}%` } as any}
        />
      </div>
    </div>
  );
};

export default EinkLoading;
