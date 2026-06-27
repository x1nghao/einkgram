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
