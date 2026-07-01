
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
