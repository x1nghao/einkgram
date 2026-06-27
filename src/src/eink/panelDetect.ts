// Einkgram — Auto panel detection (v0.5.5)
//
// When the user hasn't picked a panel from Settings, we try
// several signals to guess what kind of E-Ink device they're on:
//
//   1. CSS `monochrome` media query (Chrome 108+)
//      → reports bits per pixel (0-8). 0 = color, 8 = 256-gray.
//   2. `prefers-color-scheme` and device pixel ratio
//      → high pixel density (>= 2) often = Carta HD
//   3. `pointer: coarse` and `(hover: none)`
//      → touch-only = e-reader, not desktop
//   4. User-Agent fingerprints
//      → Kindle (Silk), BOOX, Bigme, Supernote, reMarkable, Kobo
//   5. Screen color depth
//      → 24/32 = color panel, 8 = gray, 1 = 1-bit
//   6. `navigator.maxTouchPoints` + `ontouchstart`
//      → strong touch signal = e-reader
//
// Each strategy returns a `PanelType | null`. The first non-null
// answer wins. The result is cached on first call so we don't
// re-parse the UA on every <img>.
//
// Green zone: pure detection module, no upstream touched.

import type { PanelType } from './panels';

type Strategy = () => PanelType | null;

let _cached: { value: PanelType; ts: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute; long enough that we don't
                             // re-parse on every call, short enough
                             // that hot-plugging (rare) still works.

/**
 * Try every detection strategy in order and return the first
 * non-null result. Cached for CACHE_TTL_MS.
 */
export function detectPanel(): PanelType {
  if (_cached && Date.now() - _cached.ts < CACHE_TTL_MS) {
    return _cached.value;
  }
  for (const s of STRATEGIES) {
    try {
      const v = s();
      if (v) {
        _cached = { value: v, ts: Date.now() };
        return v;
      }
    } catch {
      // Strategy threw (e.g. matchMedia not available). Move on.
    }
  }
  // No strategy matched. Cache 'unknown' too so we don't keep
  // trying on every call.
  _cached = { value: 'unknown', ts: Date.now() };
  return 'unknown';
}

/**
 * Clear the detection cache. Useful for tests and for the
 * "auto-detect" option in the Settings dropdown.
 */
export function clearDetectionCache(): void {
  _cached = null;
}

/**
 * Read a CSS custom property from :root, returning the trimmed
 * value or '' if not set / not available.
 */
function cssVar(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * Strategies. Ordered cheapest → most expensive.
 * Each function returns a PanelType or null.
 */
const STRATEGIES: Strategy[] = [
  // 1. CSS monochrome media query (Chrome 108+).
  //    reports bits per pixel of the OUTPUT device (0-8).
  //    0  → 1-bit (very rare; usually reported as 0 for color)
  //    1  → 1-bit B&W panel
  //    2-4 → 4-gray
  //    4-8 → 16/256-gray
  //    null → not supported
  strategyMonochromeMedia,

  // 2. CSS custom property set by some E-Ink browsers
  //    (e.g. BOOX NeoReader sets a custom CSS var in some
  //    versions). Cheap; do it second.
  strategyCssHint,

  // 3. Screen color depth. On E-Ink devices, this is usually
  //    reported as 8 (gray) or 24/32 (color). 1-bit devices
  //    sometimes report 24 because the OS exposes a framebuffer.
  strategyScreenColorDepth,

  // 4. User-Agent fingerprints. Most reliable for known devices.
  strategyUserAgent,

  // 5. Combined heuristics (touch + no-hover + small screen).
  strategyTouchOnly,
];

// ─────────────────────────────────────────────────────────
// Strategy 1: CSS monochrome media query
// ─────────────────────────────────────────────────────────
function strategyMonochromeMedia(): PanelType | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  // The query returns true if the device is monochrome.
  // Note: not all browsers support this query syntax.
  const mq = window.matchMedia('(monochrome: 0)');
  if (mq.media === 'not all' && !mq.matches) {
    // Browser doesn't recognize the query.
    return null;
  }
  // 0 = color, anything else is bits per pixel
  // Try higher values in order. Most specific first.
  const mq2 = window.matchMedia('(monochrome)');
  if (mq2.matches) {
    // Generic "this is monochrome". Need more detail.
    const mq8 = window.matchMedia('(monochrome-max: 1)');
    if (mq8.matches) return '1bit';
    const mq4 = window.matchMedia('(monochrome-max: 4)');
    if (mq4.matches) return '4gray';
    const mq16 = window.matchMedia('(monochrome-max: 16)');
    if (mq16.matches) return '16gray';
    return '256gray';
  }
  // Device is NOT monochrome from this query → color panel
  // OR the query isn't supported.
  if (mq2.media !== 'not all') {
    // Query is supported and says "not monochrome" → color
    // We can't tell 4096 vs 30000 from CSS alone.
    // Use pixel density as a hint.
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    if (dpr >= 2.5) return 'color-30000'; // Gallery 3 advanced
    return 'color-4096'; // Kaleido or older Gallery 3
  }
  return null;
}

// ─────────────────────────────────────────────────────────
// Strategy 2: CSS custom property hint
// Some E-Ink browsers (notably BOOX) expose device info
// via CSS custom properties on the root element.
// ─────────────────────────────────────────────────────────
function strategyCssHint(): PanelType | null {
  // BOOX NeoBrowser 3+ sets --device-type or similar. We
  // try a few common names. If none set, return null.
  const candidates = ['--eink-panel', '--onyx-panel', '--device-panel'];
  for (const name of candidates) {
    const v = cssVar(name);
    if (v === '1bit' || v === '4gray' || v === '16gray'
      || v === '256gray' || v === 'color-4096' || v === 'color-30000') {
      return v;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────
// Strategy 3: Screen color depth
// ─────────────────────────────────────────────────────────
function strategyScreenColorDepth(): PanelType | null {
  if (typeof window === 'undefined' || !window.screen) return null;
  const depth = window.screen.colorDepth;
  if (depth >= 24) {
    // Color device. We can't tell 4096 vs 30000 from this alone;
    // try the devicePixelRatio heuristic.
    const dpr = window.devicePixelRatio || 1;
    if (dpr >= 2.5) return 'color-30000';
    return 'color-4096';
  }
  if (depth === 8) return '16gray'; // 8-bit gray framebuffer
  if (depth === 4) return '4gray';
  if (depth === 1 || depth === 2) return '1bit';
  return null;
}

// ─────────────────────────────────────────────────────────
// Strategy 4: User-Agent fingerprints
// ─────────────────────────────────────────────────────────
function strategyUserAgent(): PanelType | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || '';

  // Kindle: Silk browser on Linux/Android.
  if (/Kindle|Silk/i.test(ua)) {
    // Kindle Paperwhite 4+ is 16-gray; older is 16-gray too.
    // Kindle Oasis / Colorsoft is color.
    if (/Colorsoft/i.test(ua)) return 'color-4096';
    if (/Oasis/i.test(ua) && /Signature/i.test(ua)) return '256gray';
    return '16gray';
  }

  // BOOX (Onyx): no official UA token, but Boox app / NeoBrowser
  // may include "BOOX" or "Onyx" in some versions. Most commonly
  // it's just Android + Chrome.
  if (/BOOX|Onyx/i.test(ua)) {
    // Tab Ultra / Note Air series are 16-gray Carta.
    // Tab Ultra C / Poke series with color are color-4096.
    if (/Ultra C|Poke.*[5-9]|Note Air.*C/i.test(ua)) return 'color-4096';
    return '16gray';
  }

  // Bigme: includes "Bigme" in some NeoBrowser builds.
  if (/Bigme/i.test(ua)) {
    if (/InkNote.*Color|B251C/i.test(ua)) return 'color-4096';
    return '16gray';
  }

  // Supernote: Linux + "Supernote" or "Ratta" (the parent company).
  if (/Supernote|Ratta/i.test(ua)) {
    if (/Manta|Nomad/i.test(ua)) return '16gray';
    return '16gray'; // A5 X / A6 X are Carta 300
  }

  // reMarkable: Linux + "reMarkable" or "Remarkab".
  if (/reMarkable|Remarkab/i.test(ua)) {
    // rM2 is 16-gray; Paper Pro is 16-gray.
    return '16gray';
  }

  // Kobo: "Kobo" or "KoboTouch" in UA.
  if (/Kobo/i.test(ua)) {
    // Libra Colour / Elipsa 2E are color-4096.
    if (/Libra.*Colour|Elipsa.*2E/i.test(ua)) return 'color-4096';
    return '16gray';
  }

  // Generic e-reader detection: Linux-based with no other
  // browser hints. Many custom Linux e-readers are 16-gray.
  if (/Linux/i.test(ua) && !/Android/i.test(ua) && !/CrOS/i.test(ua)) {
    // No specific match; likely a custom e-reader firmware.
    return '16gray';
  }

  return null;
}

// ─────────────────────────────────────────────────────────
// Strategy 5: Combined touch-only heuristic
// ─────────────────────────────────────────────────────────
function strategyTouchOnly(): PanelType | null {
  if (typeof window === 'undefined') return null;
  const isTouchOnly = (
    window.matchMedia?.('(hover: none)').matches
    && window.matchMedia?.('(pointer: coarse)').matches
  );
  if (!isTouchOnly) return null;

  // Touch-only + small screen → probably an e-reader.
  // Use 16-gray as a safe default; this is the most common
  // modern E-Ink panel.
  const smallScreen = (
    typeof window.screen !== 'undefined'
    && Math.min(window.screen.width, window.screen.height) < 1500
  );
  if (smallScreen) return '16gray';
  return null;
}
