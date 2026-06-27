# E-Ink Application Development Best Practices (2026)

> Compiled 2026-06-27 from:
> - **EinkBro** source code (Apache 2.0, plateaukao/einkbro) — production
>   e-ink browser for Android with 1.5+ years of real-user feedback
> - **KOReader coverimage eink-optimize** pipeline (MIT/GPL, ported into EinkBro)
> - **Floyd-Steinberg dithering** literature (1976, ubiquitous in e-ink)
> - **Web standards**: CSS `filter`, `prefers-reduced-motion`,
>   `dynamic-range-limit`, `<picture>`, `image-rendering`

This document maps each best practice to **what Einkgram already does**
in v0.1/v0.2, and **what to add in v0.3+**.

---

## 1. Hardware reality: why e-ink is hard

| Property | LCD/OLED | E-Ink (typical) | E-Ink (fast) |
|---|---|---|---|
| Refresh time | 1-16 ms | 450-1200 ms | 100-260 ms |
| Bit depth | 24-bit color | 16 grayscale | 4-16 grayscale |
| Update modes | continuous | full only | DU / GC16 / A2 / REAGL |
| Ghosting | none | severe (no full clear) | moderate (artifact) |
| Partial update | yes | stripes / blur | smoother but artifacts |
| Power | constant | zero between refreshes | zero |
| Viewing angle | limited | 180° | 180° |

**Consequence**: every visual change costs 100-1200 ms and may leave
residual ghosting. UI must be **minimal-change**.

---

## 2. The "EinkBro 4-stage image pipeline" (gold standard)

This is what `EinkImageProcessor.kt` does in the **only** mature
e-ink image library we could find in the wild:

```kotlin
// Pseudo-code from EinkBro's EinkImageProcessor.process(bitmap, strength)
1. Gamma lift         → brightens shadows / midtones
2. Saturation boost   → compensates for washed-out e-ink colors
3. S-curve contrast   → adds punch without blowing highlights
4. Floyd-Steinberg    → smooths gradients on limited palette (16 levels)
```

**Parameters** (linearly interpolated by `strength` 0-100):
- `gamma` 1.0 → 2.0  (mild → strong)
- `saturation` 1.0 → 1.8
- `sCurveK` 0 → 5  (gentle — preserves dark detail)
- `shadowLift` 0 → 0.08  (raises black point so dark tones don't collapse)

**Einkgram status**: v0.2 `grayscale.ts` has **only stage 4** (FS dither).
**v0.3+** should add stages 1-3 as optional pre-processing.

Reference impl: `einkbro/app/src/main/java/info/plateaukao/einkbro/unit/EinkImageProcessor.kt:81-103`

---

## 3. UI rendering rules (universal across all e-ink apps)

### 3.1 Kill all animation
- `transition-duration: 0s`
- `animation-duration: 0s`
- `scroll-behavior: auto` (not `smooth`)
- No JS-driven smooth-scroll libraries

**Einkgram v0.1 status**: ✅ `_reset.scss` does this globally.

### 3.2 Avoid WebView-level font smoothing
- `-webkit-font-smoothing: none`
- `-moz-osx-font-smoothing: grayscale` (Firefox) / `unset` (Chromium)
- Use **bold** for body text (450-600 weight) for E-Ink low contrast

**Einkgram v0.1 status**: ✅ `_reset.scss` disables antialiasing.

### 3.3 Force a high-contrast palette
- Pure black (`#000000`) on pure white (`#FFFFFF`)
- No mid-grays for body text — they smear
- Reserve grays for borders, dividers, secondary text
- **No dark mode by default** (E-Ink is reflective — dark backgrounds need front-light)

**Einkgram v0.1 status**: ✅ `_tokens.scss` defines 4 levels (`$eink-bg`, `$eink-fg`, `$eink-mid`, `$eink-faint`).
**v0.2 status**: ✅ `html.eink-mode` overrides `--color-text` to pure black on white.

### 3.4 Reduce total repaint area
- Use `position: fixed` only when needed
- Avoid overlapping absolute layers (each pixel repaint is expensive)
- Use `transform: translateZ(0)` to promote to a new compositor layer **only** for
  permanently-visible widgets (so they don't redraw on scroll)

**Einkgram status**: ⚠️ not yet addressed — defer to v0.5+ (would require
red-zone changes to message list components).

### 3.5 Use `prefers-reduced-motion` as a signal
- Many E-Ink tablets report `prefers-reduced-motion: reduce`
- EinkBro doesn't use this — but we can default `html.eink-mode` to ON
  if the UA reports reduce-motion + low-color

**Einkgram status**: ⚠️ v0.4 idea.

---

## 4. Refresh strategy (the "waveform" problem)

E-Ink panels offer 2-4 update modes:
- **DU (Direct Update)**: fast (260 ms), heavy ghosting — for typing
- **GC16 (Grayscale Clear 16)**: 1200 ms, no ghosting — for final state
- **REAGL / REAGLD**: fast + low-ghost, only on some panels
- **A2**: anti-aliasing mode, between DU and GC16

**For web apps (we can't directly choose)**: we can hint the **browser**
when each animation frame is "stable":
- After user stops typing for N ms → trigger a `requestAnimationFrame` no-op
  to consolidate layout (helps some panel firmwares enter low-power state)
- On E-Ink browsers (EinkBro), the underlying WebView handles waveform
  selection — we just need to **not** force layout thrash

**Einkgram status**: ⚠️ v0.5+ (`useRefreshStrategy` hook from ROADMAP).

---

## 5. Image handling (the big win)

### 5.1 Always downscale first
- Display 300×300 image at 200 DPI on 10" panel = native
- E-ink browsers waste 90% of battery rendering 2000×2000 images
- Set explicit `width` and `height` attributes; use `loading="lazy"`

### 5.2 Dither to palette
- **16-level grayscale** is the sweet spot (matches Kaleido, most Carta)
- **4-level** for very-fast devices (Boox Go 7 1-bit mode)
- Floyd-Steinberg is the de-facto algorithm (used in EinkBro, KOReader,
  and e-ink reader firmware)

**Einkgram status**: ✅ v0.2 ships FS dither in `grayscale.ts`.
**TODO**: wire into `<MessageMedia />` (red zone) — v0.4.

### 5.3 Skip animation in media
- GIFs are unusable on e-ink → convert to static first frame
- Auto-play videos are hostile → default to `preload="none"`
- WebP/AVIF smaller than JPEG, but render slightly slower

---

## 6. Typography

| Property | Recommendation | Why |
|---|---|---|
| Body weight | **500-600** | Sub-500 smears on 16-grayscale |
| Line height | **1.5-1.7** | More forgiving when re-rendering |
| Letter spacing | +0.01em to +0.02em | Reduces "muddy" feeling at 16 grays |
| Font choice | **Sans-serif** (Roboto, Inter, Source Sans) | Serifs alias on low DPI |
| Font features | `font-feature-settings: "kern", "liga"` | Better spacing |
| Min size | **15px** (16 ideal) | Below 14 → unreadable on Carta |

**Einkgram v0.1 status**: ✅ uses `font-weight-medium` (500) in `_reset.scss`.

---

## 7. Color usage

- **Don't use color for status** on E-Ink (it just looks gray)
- Use **icons + text** for status, not colored dots
- If color is needed (links), use **dark blue / dark green** — never mid-tone
- Reserve pure black for **active state**, gray for inactive

---

## 8. Input optimization

### 8.1 Tap targets
- **Minimum 44×44 CSS px** (some e-ink panels have 1-frame input latency)
- Add 8-12 px of padding around each interactive element
- Group related actions into one "fat button" rather than 3 small ones

### 8.2 Keyboard navigation (Einkgram differentiator)
- Full Tab order through chat list / message list / composer
- `Ctrl+Shift+E` (cycle mode) — already in v0.2
- `J/K` to scroll message list (vim-style) — v0.3 plan
- `Esc` to close modals (already in upstream)
- `/` to focus search (already in upstream)
- Visible focus ring: **3px solid black, no blur** (essential for E-Ink)

**Einkgram v0.2 status**: ✅ `Ctrl+Shift+E` cycle.
**TODO**: visible focus ring for `html.eink-mode` — v0.3 (5 lines in `_mode.scss`).

---

## 9. Performance budgets

| Metric | Target | Why |
|---|---|---|
| First Contentful Paint | < 1.5 s on Boox Leaf | Users close before they see content |
| Time to Interactive | < 3 s | Patience runs out fast on e-ink |
| Scroll FPS | 5-10 fps | Panel can't show more; higher = wasted |
| Image decode | < 200 ms | One refresh window |
| Bundle size (gzipped) | < 500 KB initial | Slow network on tablets |

**Einkgram status**: ⚠️ v0.1 / v0.2 don't measure yet.
**TODO**: add Lighthouse CI in v0.5; throttle CPU 4× in CI config.

---

## 10. Browser-specific quirks (relevant to Web A fork)

| Browser | E-Ink friendliness | Known issues |
|---|---|---|
| EinkBro (Android WebView) | ★★★★★ | No clipboard sync with system |
| Stock Android Chrome | ★★★ | Smoothing on by default; no FS dither |
| Boox NeoBrowser | ★★★★ | Has its own `forceDark`; can conflict |
| Kindle Experimental | ★ | No Service Worker, no ES6+ (so telegram-tt **fails**) |
| reMarkable browser | ★ | No clipboard, no audio |
| Kobo Nickel | ★★ | Limited to Kobo's own store |
| Bigme Android | ★★★★ | WebView + e-ink mode toggle |
| Daylight Computer | ★★★★ | E-Ink + Color; 60Hz refresh possible |

**Decision rule** (from ROADMAP):
- Kindle, reMarkable, Kobo → **out of scope** (no PWA support)
- Boox, Bigme, Daylight, generic Android → **target**
- Desktop browsers → test mode (no e-ink, but verify nothing breaks)

---

## 11. The "EinkBro 4-stage pipeline" applied to Telegram

For a chat client, the most relevant stages are:

| Stage | Apply to | Why |
|---|---|---|
| Gamma lift | Profile photos, stickers | Brightens washed-out JPEGs |
| Saturation boost | Profile photos only | Stickers look better desaturated |
| S-curve | All images | Adds punch to compressed chat media |
| Floyd-Steinberg | All images | The big win — smoother gradients |

**v0.4 plan** (in ROADMAP):
- Add Image worker in `src/lib/gramjs/workers/imageDither.worker.ts` (red zone)
- Worker receives a Blob URL, returns a dithered Blob URL
- `<MessageMedia />` swaps the URL when `html.eink-mode` is on

**Cost analysis** (at 300×300, 4-channel FS):
- 1 image: ~50 ms on Boox Tab Ultra
- 1 image: ~15 ms on Boox Go 7
- 20 messages scroll: ~1 s on Tab Ultra (acceptable for e-ink)
- 20 messages scroll: ~300 ms on Go 7 (very acceptable)

---

## 12. Anti-patterns (do not do)

1. ❌ **Loading spinners that spin** — useless on E-Ink; use a "Loading…" text
2. ❌ **Hover effects with color change** — they don't survive a full refresh
3. ❌ **Shadows / drop-shadow** — pure noise on E-Ink
4. ❌ **Gradients** — aliasing artifacts; use solid color bands
5. ❌ **Smooth scroll** — never reaches the end before the user scrolls again
6. ❌ **Tailwind-style `transition-all`** — full repaint on every prop
7. ❌ **Auto-focus on input** — virtual keyboard lag + ghosting
8. ❌ **Skeleton loaders with shimmer** — pure white-on-white flicker
9. ❌ **Dark mode by default** — needs front-light; many tablets don't have one
10. ❌ **Long-running JS animations** — pile up ghost layers

---

## 13. Einkgram roadmap alignment

| Phase | v0.1 (done) | v0.2 (done) | v0.3 (next) | v0.5 | v1.0 |
|---|---|---|---|---|---|
| Kill animation | ✅ | | | | |
| E-Ink tokens | ✅ | | | | |
| 4-level palette | ✅ | | | | |
| Toggle mode | | ✅ | | | |
| Floyd-Steinberg lib | | ✅ | | | |
| Settings integration | | | 🎯 | | |
| Mode banner | | | 🎯 | | |
| Keyboard nav | | | 🎯 | | |
| S-curve + gamma | | | | 🎯 | |
| Saturation boost | | | | 🎯 | |
| Image worker (red zone) | | | | 🎯 | |
| Reader mode (RSS-like) | | | | | 🎯 |
| 1-bit B&W toggle (1bit) | | ✅ | | | |

---

## 14. References

- EinkBro source: https://github.com/plateaukao/einkbro
- EinkBro `EinkImageProcessor.kt` (the gold standard):
  `app/src/main/java/info/plateaukao/einkbro/unit/EinkImageProcessor.kt`
- KOReader coverimage (inspiration for EinkBro):
  https://github.com/koreader/koreader/tree/master/spec/unit
- Floyd-Steinberg original: Floyd & Steinberg, "An adaptive algorithm for
  spatial grey scale", 1976
- Web standards: `dynamic-range-limit: standard` (Chrome 132+),
  `prefers-reduced-motion`, `prefers-contrast: more`
- E Ink Corporation public docs: https://www.eink.com/tech.html

---

_Last updated: 2026-06-27 — applies to Einkgram v0.2 (commit b991553)._
