
## v0.13 — Suppress user-uploaded custom backgrounds

**Problem**: v0.11 only suppressed the default `chat-bg-br.png` + `pattern.svg` overlay.  
Users who set a custom chat wallpaper (photo/gradient) via Telegram settings still saw muddy  
color blobs on E-Ink — the `.customBgImage::before` layer rendered `background-image: var(--custom-background)`.

**Root cause**: CSS Module hashed class name `.customBgImage` → `.Y7owXZmb` at build time.  
`_patternBackground.module.scss`'s `:global(html.eink-mode) &::before` rule was **dropped by  
Rolldown** during production CSS Module compilation — 0 bytes in dist CSS.

**Fix** (`_reset.scss` line ~88): Global attribute selector `[style*="--custom-background"]::before { display: none !important; }`,  
scoped under `html.eink-mode`. Targets the inline `style="--custom-background: url(...)"`  
attribute — never hashed, survives all build pipelines.

**Zone**: 0 red, 0 yellow, 1 green file (+12 lines).

| Metric | Value |
|---|---|
| Tests | 94/94 pass |
| Build | 11.28s |
| Dist | 67 MB |
| Deploy | https://b946bd1e.einkgram.pages.dev |

## v0.14 → v0.15 — Fix Settings row UI (label + focus ring + badge)

**Problem** (v0.14 screenshot): EinkToggle and PanelSelector rendered as
inner `<div role="button">` inside `<ListItem>`, causing:
- Lost the row label ("E-Ink mode" / "Display panel" disappeared)
- Nested focus rings (EinkToggle + ListItem-button both added outlines)
- Visually jarring black-on-white `<button>` badge that didn't match
  the rest of Settings.

**Root cause**: misunderstood upstream ListItem pattern. Tried to
put the click handler on the inner component instead of on the
`<ListItem>` itself. Upstream's pattern (from SettingsEditProfile.tsx
line 274-282) is:

  <ListItem icon="..." narrow rightElement={<value>} onClick={...}>
    <span className="flex-grow">{label}</span>
  </ListItem>

`flex-grow` makes the label push the rightElement to the edge, and
ListItem handles the click + focus state.

**Fix**:
- EinkToggle.tsx → pure span showing EINK_MODE_LABELS[mode]
- PanelSelector.tsx → pure span showing current panel label
- SettingsMain.tsx: each row uses upstream pattern, with cycle handler
  from `useEinkMode().cycle` / new `cycleActivePanel()`
- useEinkMode dispatches `eink-mode-changed` window event so sibling
  useEinkMode instances (in EinkToggle) stay in sync
- New `cycleActivePanel()` in panels.ts + `eink-panel-changed` event
  for PanelSelector cross-instance sync

**Zone**: 0 red, 0 yellow, 1 red file (+15 lines: 2 new ListItem rows
+ useEinkMode/cycleActivePanel calls in SettingsMain). All Einkgram
component changes are green zone.

| Metric | Value |
|---|---|
| Tests | 94/94 pass (after `npm run build:production`) |
| Build | 6.81s |
| Dist | 67 MB |
| Commit | 7c44835 |
