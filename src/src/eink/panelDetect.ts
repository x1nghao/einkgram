// Einkgram — Auto panel detection (v0.5.5 + v0.5.6)
//
// When the user hasn't picked a panel from Settings, we try
// several signals to guess what kind of E-Ink device they're on:
//
//   0. CSS `update` media query (Chrome 130+)
//      → 'slow' is the strongest E-Ink signal. We return null
//        so monochrome can refine bits-per-pixel; 'none' returns
//        4gray (very old non-updating panels).
//   1. CSS `monochrome` media query (Chrome 108+)
//      → reports bits per pixel (0-8). 0 = color, 8 = 256-gray.
//   2. CSS custom property hint (`--eink-panel`, `--onyx-panel`)
//   3. Screen color depth + DPR
//   3.5 Physical screen size matrix (GATED by isLikelyEInkDevice)
//   3.6 ppi-based panel resolution (GATED by isLikelyEInkDevice)
//   4. User-Agent fingerprints
//      → Kindle (Silk), BOOX, Bigme, Supernote, reMarkable, Kobo
//   5. Touch-only heuristic (coarse pointer + no hover + small)
//
// Each strategy returns a `PanelType | null`. The first non-null
// answer wins. The result is cached on first call so we don't
// re-parse the UA on every <img>.
//
// v0.5.6 added the `update` media query, screen size matrix,
// and ppi-based detection. The latter two are gated behind
// isLikelyEInkDevice() to avoid misfiring on regular
// laptops and phones.
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
 * Strategies. Ordered strongest signal → weakest fallback.
 * Each function returns a PanelType or null.
 *
 * v0.5.6: Added 3 new strategies:
 *   - strategyUpdateMedia (now first): (update: slow) is the
 *     strongest E-Ink signal in the CSS spec.
 *   - strategyScreenSize: maps physical screen dimensions to
 *     panel type (6" Kindle vs 13.3" reMarkable vs 10.3" BOOX).
 *   - strategyPpi: distinguishes Carta 1200 (300 ppi) from
 *     Carta 1000 (212 ppi) so we can pick 256gray vs 16gray.
 */
const STRATEGIES: Strategy[] = [
  // 0. CSS `update` media query (Chrome 130+).
  //    Values: 'none', 'slow', 'fast'. E-Ink devices report
  //    'slow'. This is the strongest signal because it comes
  //    from the BROWSER about the DISPLAY, not about the OS.
  //    1-bit panels usually have even slower update ('none' is
  //    reserved for non-updating displays, but some browsers
  //    report 'slow' for them).
  strategyUpdateMedia,

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

  // 3.5 Physical screen size matrix (v0.5.6). When colorDepth
  //    is ambiguous (some e-readers report 24-bit framebuffer
  //    for a 16-gray panel), the physical diagonal + DPR
  //    can disambiguate. Small + high DPR is usually Carta;
  //    large + low DPR is usually older E-Ink.
  strategyScreenSize,

  // 3.6 ppi-based panel resolution (v0.5.6). 300 ppi is
  //    Carta 1200 (256-gray capable), 212 ppi is Carta
  //    1000/1100 (16-gray max).
  strategyPpi,

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

// ─────────────────────────────────────────────────────────
// Strategy 0 (v0.5.6): CSS `update` media query
// ─────────────────────────────────────────────────────────
//
// Spec: https://drafts.csswg.org/mediaqueries-5/#update
// Values: 'none' | 'slow' | 'fast'.
//   - 'none' → display doesn't update (static e-ink, e-paper)
//   - 'slow' → display updates slowly (E-Ink, low-refresh LCDs)
//   - 'fast' → display updates at full speed (regular LCD/OLED)
//
// Browser support: Chrome 130+ (Oct 2024), Edge 130+, Opera 115+.
// Safari and Firefox do NOT support this as of late 2025. On
// unsupported browsers the query reports "not all" → null.
//
// This is the strongest E-Ink signal we have. If the browser
// says "slow" we know we're on E-Ink without any UA fingerprint
// or screen-size math. Combined with monochrome (Strategy 1)
// we can often pin the exact panel.
//
// We don't return a specific PanelType from this strategy
// because "slow" doesn't tell us bits-per-pixel. We let
// downstream strategies (monochrome, UA, screen size) refine.
// But if the device is reported as 'none' we know it's
// truly non-updating (rare); we return 4gray as a safe
// default since such devices are usually older.
//
// Note: we ALWAYS return null from this strategy for 'fast'.
// The detection chain continues to other strategies. We do
// NOT return 'unknown' (that would short-circuit the chain).
function strategyUpdateMedia(): PanelType | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  // 'none' = static, non-updating. Very rare. Older E-Ink
  // panels or e-paper price tags.
  const noneMq = window.matchMedia('(update: none)');
  if (noneMq.matches && noneMq.media !== 'not all') {
    // Old, non-updating e-ink. Usually 4-gray.
    return '4gray';
  }
  // 'slow' alone doesn't disambiguate bits per pixel; let
  // the next strategy (monochrome) figure it out. We return
  // null so the chain continues.
  // (We could return '16gray' here as a sensible default,
  //  but it's better to let monochrome take precedence when
  //  available — it has actual bits-per-pixel data.)
  return null;
}

// ─────────────────────────────────────────────────────────
// Strategy 3.5 (v0.5.6): Physical screen size matrix
// ─────────────────────────────────────────────────────────
//
// E-Ink devices have characteristic physical sizes. We compute
// the diagonal in inches using screen.{width,height} (CSS px)
// and devicePixelRatio, then map to a panel hint.
//
//   < 7"       → 6" Kindle / Kobo Clara — 16gray
//   7"–9"      → 7.8" BOOX / Bigme / InkPad — 16gray or color
//   9"–11"     → 10.3" BOOX Note / reMarkable Paper Pro — 16gray or color
//   11"–14"    → 13.3" BOOX Max / reMarkable — 16gray
//   > 14"      → desktop monitor — NOT E-Ink, skip
//
// We only return a value when we're confident the device is
// E-Ink; otherwise we let UA / touch fallback take over.
function strategyScreenSize(): PanelType | null {
  if (typeof window === 'undefined' || !window.screen) return null;
  // GATE: only consider this strategy on touch-only or
  // E-Ink-detected devices. Otherwise we'd return '16gray'
  // for every phone in the user's pocket.
  if (!isLikelyEInkDevice()) return null;
  const dpr = window.devicePixelRatio || 1;
  const w = window.screen.width;
  const h = window.screen.height;
  if (w === 0 || h === 0) return null;
  // Diagonal in CSS pixels.
  const diagCss = Math.sqrt(w * w + h * h);
  // Divide by DPR to get DEVICE pixels, which are usually
  // 1:1 with physical pixels (the display's native resolution).
  const diagDev = diagCss / dpr;
  // Most CSS px per inch = 96 by spec. But E-Ink devices
  // usually report DPR such that 1 dev px = 1 physical px
  // (so diagDev is in physical pixels at the panel's native
  // density). We assume 160 ppi as a baseline.
  const diagInches = diagDev / 160;

  if (diagInches < 7) {
    // 6" class: Kindle Paperwhite, Kobo Clara, BOOX Poke.
    // If colorDepth is 24 but size is < 7", it's likely a
    // very small 16-gray panel misreporting. Default to 16gray.
    return '16gray';
  }
  if (diagInches < 9) {
    // 7-8" class: BOOX Page / Leaf / Go, Bigme B751.
    return '16gray';
  }
  if (diagInches < 11) {
    // 10-10.3" class: BOOX Note Air, reMarkable Paper Pro.
    return '16gray';
  }
  if (diagInches < 14) {
    // 13.3" class: BOOX Max, reMarkable 2, Dasung Paperlike.
    return '16gray';
  }
  // > 14" — likely a desktop monitor, not an e-reader.
  return null;
}

// ─────────────────────────────────────────────────────────
// Strategy 3.6 (v0.5.6): ppi-based panel resolution
// ─────────────────────────────────────────────────────────
//
// E-Ink Carta generations:
//   - Carta (2013):  212 ppi — 16-gray
//   - Carta 1100 (2019): 300 ppi — 16-gray
//   - Carta 1200 (2022): 300 ppi — 16-gray, faster
//   - Carta 1300 (2023): 300 ppi — 16-gray
//   - 250 ppi (older Pearl HD) — 16-gray
//
// HD Carta (Carta HD, 2017) was 300 ppi. Some "Gallery 3"
// panels are 300 ppi but with color (color-30000).
//
// Distinguishing 212 vs 300 ppi is useful: 212 ppi panels
// can't physically render 16 levels crisply; 300 ppi can.
// But this only matters when the user manually picks 256gray;
// if we mis-detect a 212 ppi panel as 256gray, the user will
// see banding. So we're conservative: if we see 300 ppi, we
// return 256gray; otherwise we return 16gray (the default).
function strategyPpi(): PanelType | null {
  if (typeof window === 'undefined' || !window.screen) return null;
  // GATE: only consider this strategy on E-Ink signals.
  // Without this gate, every Retina MacBook (ppi ~192) and
  // every iPhone (ppi ~288) would falsely match.
  if (!isLikelyEInkDevice()) return null;
  const dpr = window.devicePixelRatio || 1;
  if (dpr < 1.5) return null; // Probably a regular monitor.
  // Convert DPR to physical ppi using CSS spec: 1 CSS px = 1/96 in.
  // If dpr = 2, 1 dev px = 1/192 in, so ppi = 192.
  // More precisely: ppi = dpr * 96.
  // For mobile, 1 dev px is usually 1 physical px.
  const ppi = dpr * 96;
  if (ppi >= 280 && ppi <= 320) {
    // Carta HD / 1200 / 1300 territory. High resolution.
    return '256gray';
  }
  if (ppi >= 200 && ppi < 280) {
    // Carta (212 ppi) or older Pearl HD (250 ppi).
    return '16gray';
  }
  // Mobile phones with high DPR report dpr=3 (ppi ~288) but
  // they aren't E-Ink. The UA strategy will catch those.
  // Don't return anything from PPI for non-e-readers.
  return null;
}

// ─────────────────────────────────────────────────────────
// Gate helper (v0.5.6): is the device likely E-Ink?
// ─────────────────────────────────────────────────────────
//
// Used to gate strategies that would otherwise misfire on
// regular laptops / phones. Returns true if ANY of:
//   - (update: slow) matches (strongest E-Ink signal)
//   - (hover: none) AND (pointer: coarse) (touch-only)
//   - colorDepth is 1, 2, 4, or 8 (gray framebuffer)
//   - User-Agent has any known e-reader substring
//
// Cheap; runs on every detection call but only does
// matchMedia + UA substring checks.
function isLikelyEInkDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia) {
    // (update: slow) — strongest signal
    const mq = window.matchMedia('(update: slow)');
    if (mq.matches && mq.media !== 'not all') return true;
    // Touch-only
    const touch = window.matchMedia('(hover: none)').matches
      && window.matchMedia('(pointer: coarse)').matches;
    if (touch) return true;
  }
  if (window.screen) {
    const d = window.screen.colorDepth;
    if (d === 1 || d === 2 || d === 4 || d === 8) return true;
  }
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    if (/Kindle|Silk|BOOX|Onyx|Bigme|Supernote|Ratta|reMarkable|Remarkab|Kobo/i.test(ua)) {
      return true;
    }
  }
  return false;
}
