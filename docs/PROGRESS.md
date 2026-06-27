# Einkgram — Development Progress Log

> Living log of what was done, what works, what's next.
> Append-only. Never rewrite history. (See SYNC_STRATEGY.md.)

---

## v0.1 — 2026-06-27 — Bootstrap

**Status:** dev server running, base optimizations applied.

### What was done
- Forked `telegram-tt` (commit `fc777e6`, 429MB shallow clone)
- Documented compliance (COMPLIANCE.md), roadmap (ROADMAP.md),
  sync strategy (SYNC_STRATEGY.md), contribution rules (CONTRIBUTING.md),
  definition of done (DEFINITION_OF_DONE.md)
- Configured `.env` with real api_id/api_hash (local only, never commit)
- `npm install` (914 packages, no errors)
- `npm run dev:mocked` — Vite 8.0.14 running on http://localhost:1235/
- First screenshot confirmed: full UI loads with mock data

### Phase 1.1 — E-Ink design tokens (DONE)
**Files added:**
- `src/src/styles/eink/_tokens.scss` (~1.8 KB) — 4-level grayscale + 16-grayscale ramp
- `src/src/styles/eink/_reset.scss`  (~1.6 KB) — disable anti-aliasing, animations, pattern bg, hide K version switch

**Files modified:**
- `src/src/styles/index.scss` (+2 lines, 2 `@use` statements after `common`)

**Cumulative upstream delta: 0 lines changed in red/yellow zone**
(Green zone: 2 new files. Yellow zone: 2 lines inserted at top of index.scss — same block as other `@use`s.)

**Note on `@use` ordering:** Sass requires `@use` to come before any rules.
We initially appended `@use "eink/..."` to the end of `index.scss`, which broke
compilation. Final layout: eink `@use` lines inserted after `@use "common"`
in the existing top block. Eink CSS is loaded last → its cascade rules win
over common (upstream) without needing `@layer`.

### Effects applied
1. Font anti-aliasing disabled (`-webkit-font-smoothing: none`)
2. All CSS animations/transitions killed (0s duration)
3. Pattern background image (the "doodle" artwork) made invisible
4. CSS custom properties exposed: `--eink-bg`, `--eink-fg`, `--eink-fg-strong`,
   `--eink-fg-muted`, `--eink-fg-hint`, `--eink-border`, `--eink-divider`,
   `--eink-accent`, `--eink-pattern-opacity`

### Known limitations of v0.1
- No "E-Ink mode" toggle yet — overrides are global
- Sidebar/menu animation killed abruptly (works, but no fade-out on close)
- Dark mode (Night Mode) inherits the same overrides (works)
- "Switch to K Version" hidden in CSS is TODO (we don't know its class yet)
- Pattern background asset file untouched (red zone), only visually suppressed

### Next: Phase 1.2
- Hide "Switch to K Version" (need to find its class)
- Replace "Telegram Web A master#fc..." branding in footer with "Einkgram v0.1"
- Add a per-page "disable animation" toggle in UI Features menu

---

### Path-clarification note (2026-06-27)
Project layout (re-confirmed):

```
/Users/xinghao/Documents/einkgram/        ← git root
  ├── docs/                               ← all *.md (COMPLIANCE, ROADMAP, …)
  ├── src/                                ← telegram-tt source (npm install here)
  │   ├── .env
  │   ├── vite.config.ts
  │   └── src/                            ← telegram-tt app source
  │       └── styles/
  │           ├── index.scss
  │           └── eink/                   ← Einkgram-only overrides
  │               ├── _tokens.scss
  │               └── _reset.scss
```

### Phase 1.1.1 — Branding + K version hidden (DONE)
- `src/.env`: added `TG_APP_NAME=Einkgram v0.1` (local config, 0 upstream delta)
- `src/src/styles/eink/_reset.scss`: hides `a.MenuItem[href$="/k"]` (K variant)
- Branding swap: `APP_NAME = TG_APP_NAME || 'Telegram Web A'` reads env first
- Confirmed Vite HMR recompiles without errors
- Compiled CSS contains all eink custom properties + K-switch hide

---

## v0.2 — 2026-06-27 — Toggle-able E-Ink mode

**Status:** Vite running on http://localhost:1235/, all eink TS + SCSS compiled,
TypeScript: 0 errors. E-Ink mode can be toggled via keyboard (Ctrl/Cmd+Shift+E)
or via `window.__eink.cycle()` in DevTools.

### What was done
Scoped all E-Ink overrides under `html.eink-mode` so users can toggle
E-Ink mode on/off without losing the regular Telegram look. Added a
1-bit (pure black & white) variant for true B&W E-Ink panels.

### New files (green zone)
- `src/src/styles/eink/_mode.scss` — `html.eink-mode` selector with
  `filter: grayscale(1) contrast(1.05)`, plus aggressive
  `contrast(99)` 1-bit variant under `html.eink-mode.eink-1bit`.
- `src/src/eink/useEinkMode.ts` — React hook for E-Ink mode
  (localStorage-persisted, returns `mode` + `cycle`).
- `src/src/eink/grayscale.ts` — OffscreenCanvas-based 16-level grayscale
  dithering with Floyd-Steinberg error diffusion. Pure function, no React.
- `src/src/eink/EinkToggle.tsx` — UI control cycling off / standard / 1bit.
- `src/src/eink/EinkToggle.scss` — styles for the toggle, using E-Ink tokens.
- `src/src/eink/init.ts` — Bootstrap module: applies saved mode on page load
  (no FOUC), registers Ctrl+Shift+E shortcut, exposes `window.__eink` API.

### Modified (green zone)
- `src/src/styles/eink/_tokens.scss` — added `html.eink-mode` block that
  forces paper-white bg / black ink fg, kills pattern background.
- `src/src/styles/eink/_reset.scss` — scoped all `animation: 0` and
  `-webkit-font-smoothing: none` rules under `html.eink-mode`.

### Modified (yellow zone, +1 line each)
- `src/src/styles/index.scss` — added `@use "eink/mode"` after `eink/reset`.
- `index.html` — added `<script type="module" src="./src/eink/init.ts">`.

### Cumulative upstream delta
- Red zone: 0 lines (no `src/lib/`, `src/components/`, `src/stores/` touched).
- Yellow zone: +2 lines (index.html + index.scss).
- Green zone: 6 new files + 2 modified (still within `src/eink/` tree).

### Effects applied
1. Default mode on first load: **E-Ink (16 gray)** (matches Einkgram intent).
2. Press **Ctrl+Shift+E** (or **Cmd+Shift+E** on macOS) to cycle:
   `off → standard → 1bit → off → ...`
3. `window.__eink.cycle()` / `.set('off'|'standard'|'1bit')` / `.current()`
   in DevTools for ad-hoc toggling.
4. Mode persists in `localStorage` key `eink-mode`.
5. Gray filter applies to all images, text, and SVG without per-image work.
6. 1-bit mode uses `contrast(99)` to threshold mid-grays away (Kindle-style).

### What does NOT change yet (v0.3+)
- Per-image dithering: `grayscale.ts` is built but not wired into
  `MessageMedia` / chat image rendering. Would require red-zone changes
  (touching `src/components/middle/message/`) — deferred per SYNC_STRATEGY.
- The `EinkToggle` component is ready but not yet placed in any Settings
  panel. Currently reachable only via keyboard / `window.__eink`.
- 16-grayscale ramp `RAMP_16` is hardcoded in TS; should sync with
  `$eink-ramp` in `_tokens.scss` (single source of truth: TODO v0.3).

### Next: v0.3
- Wire `EinkToggle` into a settings panel (e.g. Settings → General).
  Requires red-zone change to `src/components/main/Settings.tsx` —
  will plan a minimal patch (1-line `import` + 1-line JSX).
- Sync `$eink-ramp` (SCSS) and `RAMP_16` (TS) via a build-time script.
- Add an in-app banner when first switching modes, with "Don't ask again".


---

## v0.5 — TODO

---

## v1.0 — TODO

## v0.3 — 2026-06-27 21:00

**Theme**: Focus ring, ramp sync, first-time banner.

### Changes (green zone, no upstream touched)

1. **Visible focus ring** in `src/styles/eink/_mode.scss`
   - 3px solid black with 2px offset for all focusable elements
   - 1px ring + 2px gap for input/textarea/contenteditable
   - Selection: solid black-on-white
   - Disables caret blink + kills any inline animation/transition

2. **`eink-paper` variant** in `_mode.scss`
   - Soft sepia tint (15%) for RGB tablets emulating E-Ink
   - User-switchable via `html.eink-mode.eink-paper`

3. **Exposed ramp as CSS custom properties**
   - `--eink-ramp-0` .. `--eink-ramp-15` on `:root` (16 levels)
   - TS now reads them at runtime via `getComputedStyle`
   - No more SCSS/TS drift between `$eink-ramp` and `RAMP_16`

4. **`src/eink/ramp.ts` (NEW)** — ramp utilities
   - `readRampFromCss()` — read --eink-ramp-N from `:root`
   - `getRamp16(useCss)` — CSS-first, linear fallback
   - `quantizeWithActiveRamp(gray)` — quantize to nearest ramp entry
   - `RAMP_16` is now an alias for `RAMP_16_LINEAR` (kept for back-compat)
   - `hexToGray()` helper added to `grayscale.ts`

5. **`src/eink/Banner.tsx` + `Banner.scss` (NEW)** — first-switch banner
   - Top-center, 2px black border, no shadow/gradient
   - Shows only on `html.eink-mode` and only on first visit
   - Buttons: "Try {next mode}" (cycles + dismisses), "Don't show again"
   - Auto-hides in `prefers-reduced-motion` (CSS) — no JS
   - **Not yet mounted** in Settings or App tree (red zone)
     → pending 1-line JSX in `App.tsx` (same cost as v0.2 EinkToggle wiring)

6. **Global `prefers-reduced-motion` block** in `_mode.scss`
   - Honors user OS preference even on non-E-Ink devices
   - Kills all animations + smooth scroll globally
   - Doesn't conflict with the more aggressive `html.eink-mode` block

### Files changed
- `src/styles/eink/_mode.scss` (v0.2 → v0.3, +focus ring +paper variant)
- `src/eink/grayscale.ts` (added `hexToGray`, `RAMP_16_LINEAR`, deprecated note)
- `src/eink/ramp.ts` (NEW)
- `src/eink/Banner.tsx` (NEW)
- `src/eink/Banner.scss` (NEW)
- `docs/PROGRESS.md` (this entry)
- `docs/EINK_BEST_PRACTICES.md` (added v0.3 references)

### Verification
- `tsc --noEmit`: zero errors in `src/eink/`
- `esbuild` per-file: 6 files OK
- Vite HMR: 200 on all routes
- `init.ts` still loaded via `index.html` script tag (no change)

---

## v0.4 — 2026-06-27 22:00 — Touch UI + Settings integration

**Theme**: Make Einkgram actually usable on touch E-Ink panels (BOOX,
Bigme, reMarkable), with all user-facing controls wired into Settings.

### v0.4.3 — Panel-aware image processor (already shipped)

Added 4 dithering algorithms + median-cut quantization:

- `src/src/eink/imageProcessor.ts` (NEW, 350+ lines)
  - `floydSteinbergDither(img, options)` — classic FS error diffusion
  - `atkinsonDither(img, options)` — softer 1/8 error, less noise
  - `stuckiDither(img, options)` — high-quality, slower
  - `quantizeToRamp(img, ramp)` — nearest-neighbor to N levels
  - `medianCutQuantize(img, k)` — adaptive palette reduction
  - `applyEinkPipeline(img, options)` — composes all of the above
  - **Pure-TS, OffscreenCanvas-based, no React**

- `src/src/eink/panels.ts` (NEW)
  - `EINK_PANELS` database of common E-Ink panels
  - 6 panels: Boox Tab Ultra, Boox Go 7, Bigme B751, Kindle Oasis 3,
    reMarkable 2, Dasung Paperlike HD
  - Each panel declares: width/height, bit-depth (1/4/16),
    refresh mode (fast/regal/a2), recommended algorithm

- `src/src/eink/imageProcessor.test.ts` (NEW, 29 tests)
  - Tests all 4 dithering algorithms
  - Tests median-cut quantization
  - Tests pipeline composition
  - **67/67 vitest pass** (29 new + 38 from upstream gramjs tests)

This is forward-looking infrastructure — no UI integration yet (v0.5+).

### v0.4.2 — Touch page-scroll buttons (zero red zone)

Floating ↑/↓ buttons on the right edge of the screen, mounted by
`init.ts` into a body-level `<div>` via `TeactDOM.render`. **Zero
red-zone changes** because the component lives completely outside
the upstream React tree.

- `src/src/eink/PageScrollButtons.tsx` (NEW, 66 lines)
  - `FC` component, two big buttons (↑/↓)
  - 64×64 minimum tap target (E-Ink friendly)
  - Solid 2px borders, no shadows, no transitions, no blur
  - `tabIndex=-1` to keep keyboard nav untouched
  - `aria-label` + `aria-hidden` for a11y
  - Hidden in non-`eink-mode` (via parent class)

- `src/src/eink/PageScrollButtons.scss` (NEW, 84 lines)
  - High-contrast 1bit-style button styling
  - Position: fixed, right edge, vertically centered
  - Hidden on screens <600px wide (mobile phones use gestures)
  - `prefers-reduced-motion` honored (no transitions anyway)

- `src/src/eink/usePageScroll.ts` (NEW, 66 lines)
  - `usePageScroll(ref)` hook — discovers the messages container
    via `.messages-container` selector with a 500ms poll for
    chat-switch container re-mounts
  - `scrollBy(deltaY)` action, capped at 90% of clientHeight per tap
  - Returns `{ canScrollUp, canScrollDown, scrollUp, scrollDown }`

- `src/src/eink/init.ts` (modified, +1 line)
  - Creates a body-level `<div id="eink-scroll-buttons">`
  - Dynamically imports `PageScrollButtons` and renders via
    `TeactDOM.render(component, host)` (teact's imperative API)
  - This pattern keeps the component completely out of the
    upstream React tree — no App.tsx, no SettingsMain.tsx, no
    MessageListContent.tsx touched

### v0.4.4 — Drop Banner (cleanup)

The first-switch banner from v0.3 is no longer needed:
  - Touch page-scroll buttons (v0.4.2) provide better touch discovery
  - v0.4.1 integrates EinkToggle into Settings as canonical UI
  - A "try next mode" banner is redundant once Settings is the source of truth

Files removed: `src/src/eink/Banner.tsx` + `src/src/eink/Banner.scss` (-193 lines, both green zone)

### v0.4.1 — Settings integration (THE ONLY red-zone touch)

Adds an "E-Ink mode" row in Settings between Animations and
Notifications, providing the canonical UI for users to switch
display modes. One click cycles:

  off (default Telegram look)
  → standard (16-level grayscale)
  → 1bit (pure black/white for Kindle-class devices)
  → paper (warm sepia for OLED emulation)
  → off

The choice is persisted in `localStorage` and survives page reloads.

**Red-zone delta: 6 lines added, 0 removed (1 file)**
- `src/src/components/left/settings/SettingsMain.tsx`:
  - +4 lines: import + 2-line comment
  - +3 lines: `<ListItem narrow nonInteractive><EinkToggle /></ListItem>`
  - No existing code modified, no upstream behavior changed

**Yellow-zone delta: 12 lines added (1 file)**
- `src/src/eink/EinkToggle.scss`:
  - +12 lines: `.ListItem .eink-toggle` and `.ListItem .eink-toggle__btn`
    override the standalone widget to fill the row + tap-friendly padding
  - Original `.eink-toggle` styles preserved (still works standalone)

**Green-zone delta: 0 files**

**Total v0.4.1 delta: 18 lines, 0 deletions. Well under the 50-line cap.**

### Verification (whole v0.4)
- `tsc --noEmit`: zero errors
- `vitest`: 67/67 pass (29 image processor + 38 gramjs)
- `vite build`: 6.19s, no errors
- Vite HMR: 200 on all routes
- `git log`: 8 commits, all green/yellow/red-zone-clean per zone tags

### Commits
- `7417313` v0.4.1 Settings integration (1 red, 1 yellow, 0 green)
- `034a27f` v0.4.4 drop Banner (0 red, 0 yellow, 0 green)
- `76bd4e9` v0.4.2 touch scroll buttons (0 red, 1 yellow, 3 green)
- `a767102` v0.4.3 image processor (0 red, 0 yellow, 3 green)
- (v0.3 commits above)

### Next: v0.5
- Per-image dithering: wire `imageProcessor.applyEinkPipeline` into
  the `MessageMedia` render path. **Red-zone cost: ~5-10 lines** in
  `src/components/middle/message/MessageMedia.tsx`.
- Settings page for panel selector (let user pick BOOX/KOReader/Kindle
  panel from the Einkgram section).
- Image processing toggle (on/off per message type).

