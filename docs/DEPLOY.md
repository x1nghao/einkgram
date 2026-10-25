# Einkgram — Deployment Guide

Einkgram deploys to **Cloudflare Pages** (project `einkgram`) with Wrangler.

- Production: <https://einkgram.boki.one> (also `einkgram.pages.dev`)
- Direct deployment URLs: `https://<hash>.einkgram.pages.dev`

For E-Ink devices to install a PWA, you need:
1. **HTTPS** (Cloudflare Pages provides this for free)
2. **A valid manifest** (`einkgram.webmanifest`, swapped in at build time)
3. **A service worker** (the upstream one ships with the build)

---

## Quick start (local deploy via Wrangler)

Wrangler authenticates on first use (`npx wrangler login`, browser OAuth).

```bash
npm run build:production          # build + strip build-stats and dev icons
bash dev/cleanup-dist.sh          # optional: report dist size
npx wrangler pages deploy dist --project-name einkgram --branch main --commit-dirty=true
```

`--branch main` targets the project's production branch; any other branch
creates a preview deployment. `APP_TITLE` (read from `.env`) sets the page
title — keep `APP_TITLE=Einkgram` in `.env` (gitignored, local-only).

---

## What gets deployed

The `dist/` folder after `npm run build:production` is ~55 MB
(most of it is the 64-px emoji set, sound files and the WASM
fasttext classifier for spam detection). It includes:

| File | Purpose |
|------|---------|
| `index.html` | App entry, references `einkgram.webmanifest` |
| `einkgram.webmanifest` | PWA manifest (name, icons, theme) |
| `service.worker-*.js` | Upstream service worker (offline + cache + push) |
| `index-*.js`, `index-*.css` | Hashed app bundles |
| `img-apple-64/` | Emoji set (the 160-px set is intentionally not built) |

---

## Testing on a real E-Ink device

After deploy, on your BOOX / Bigme / Supernote:

1. Open the URL in the system browser (NeoBrowser, etc.).
2. The browser may or may not show an install prompt
   depending on the OS. If not, look for "Add to Home
   Screen" in the browser menu.
3. After install, the app appears as "Einkgram" on the
   home screen and launches in standalone mode (no
   browser chrome).
4. **Critical for E-Ink:** the service worker only enables
   full offline support AFTER the first successful load.
   So open the URL online first, let it cache everything
   (visible in Settings → Apps → Einkgram → Storage), and
   then you can use it offline.

---

## Known PWA limitations on E-Ink

- **Push notifications** (the upstream service worker
  supports them) need VAPID keys. Not configured by
  default; not needed for an E-Ink device (the user is
  actively looking at it).
- **Background sync** (used for sending messages while
  offline) is supported by the service worker but
  unreliable on Android WebView. Out of scope.
- **App shortcuts** (the "Saved Messages" shortcut in
  the manifest) require Android 7.1+; older BOOX OS
  versions ignore them silently.

---

## Troubleshooting

**`wrangler` asks for login or an account**
→ Run `npx wrangler login` once; credentials are stored in
  `~/Library/Preferences/.wrangler/config/default.toml`.

**Build fails on "Cannot find module 'gramjs'"**
→ Run `npm ci` in the project root (where `package.json` lives).

**Page loads but Telegram login fails**
→ Check that `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` are
  set in `.env` — they are compiled into the bundle at
  build time. The first screen asks for a phone number,
  then a verification code.

**"Add to Home Screen" doesn't show up**
→ Some E-Ink browsers (especially older BOOX firmware)
  hide the PWA install banner. Try the browser's menu
  directly. Or bookmark the URL and add it to the home
  screen as a regular bookmark (works but no standalone
  mode).

**Service worker doesn't cache the app**
→ Service workers require HTTPS (Cloudflare Pages has it)
  and a same-origin scope. If you're testing on
  `http://192.168.x.x:1234` (Vite dev), the SW won't
  register. Test on the deployed URL.
