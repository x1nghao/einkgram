# Einkgram

E-Ink optimized Telegram web client — a fork of
[telegram-tt](https://github.com/Ajaxy/telegram-tt) (Telegram Web A) rebuilt
for electronic-ink displays: paper-white rendering, high-contrast focus
rings, page-scroll controls and an optional reader mode, with upstream
animations and wallpapers suppressed by an e-ink stylesheet layer.

**Live**: <https://einkgram.boki.one>

## What's different from upstream

- `src/eink/` — a self-contained e-ink layer loaded as a second entry script:
  e-ink mode (on/off), font-weight cycle (normal / medium / bold), reader
  mode, fixed page-scroll buttons, chat-wallpaper suppression, anti-flicker
  boot and the PWA manifest hook
- `src/styles/eink/` — e-ink design tokens + rendering reset scoped under
  `html.eink-mode`
- 8 minimal patches to upstream files (full list in
  [docs/SYNC_STRATEGY.md](docs/SYNC_STRATEGY.md)); the protocol layer
  (`lib/gramjs`, `api`) is untouched
- Emoji limited to the 64-px set (−63 MB in `dist`) and production
  sourcemaps disabled (−18 MB)
- Deployed to Cloudflare Pages via Wrangler
  ([docs/DEPLOY.md](docs/DEPLOY.md)); no CI deployment workflow

## Development

```bash
npm ci              # node >= 24.15
npm run dev         # real API dev server (localhost:1234)
npm run dev:mocked  # mocked client — currently broken upstream, may hang
npm run check:ts    # tsc + eslint
npm run check:css   # stylelint
npm test            # vitest (193 tests)
npm run build:production && bash dev/cleanup-dist.sh
```

## Syncing with upstream

Quarterly `git merge upstream/master` with an 8-file patch checklist —
see [docs/SYNC_STRATEGY.md](docs/SYNC_STRATEGY.md).

## License

GPL-3.0 — inherited from telegram-tt.
