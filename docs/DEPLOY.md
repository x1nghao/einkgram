# Einkgram — Deployment Guide

This document describes how to deploy Einkgram to **GitHub Pages**
for testing on real E-Ink devices.

For E-Ink devices to install a PWA, you need:
1. **HTTPS** (GitHub Pages provides this for free)
2. **A valid `manifest.webmanifest`** (already wired up in v0.6.1)
3. **A service worker** (Telegram-tt ships one, already enabled)

---

## Quick start (automated)

We have a GitHub Actions workflow at
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
that builds and deploys on every push to `main`.

To use it:

1. **Push the repo to GitHub.** Einkgram's repo is not on GitHub
   yet (this workspace is local-only). You need to:
   - Create a new GitHub repo (e.g. `einkgram/einkgram` or your
     own fork)
   - Push this directory to it:
     ```bash
     cd /Users/xinghao/Documents/einkgram
     git remote add origin git@github.com:YOUR_USER/einkgram.git
     git push -u origin main
     ```

2. **Enable GitHub Pages** in repo Settings:
   - Settings → Pages → Source: **GitHub Actions**
   - Save

3. **Wait for the first build.** The Actions tab will show
   the workflow run. Build takes 1-2 minutes. The deploy step
   publishes to `https://YOUR_USER.github.io/einkgram/`.

4. **(Optional) Set Telegram API credentials** as repo
   secrets (Settings → Secrets and variables → Actions):
   - `TELEGRAM_API_ID`
   - `TELEGRAM_API_HASH`
   - Without these the app still builds and loads, but the
     user has to enter them in-app on first login.

5. **Open the URL on your E-Ink device.** Tap the install
   button in the browser's address bar to install the PWA.
   It will appear on the home screen as "Einkgram".

---

## Manual deploy (no GitHub Actions)

If you don't want to use Actions, you can build locally and
push the `dist/` folder to a separate branch:

```bash
cd /Users/xinghao/Documents/einkgram/src
npm install
npm run build:production
# dist/ is the deployable site
cd dist
git init
git checkout -b gh-pages
git add .
git commit -m "deploy: build at $(date +%Y-%m-%dT%H:%M:%S)"
git push -f git@github.com:YOUR_USER/einkgram.git gh-pages
```

Then in repo Settings → Pages → Source: **Deploy from a
branch** → Branch: **gh-pages** → / (root).

---

## What gets deployed

The `dist/` folder after `npm run build:production` is
~12 MB (most of it is emoji, sound files, and the WASM
fasttext classifier for spam detection). It includes:

| File | Purpose |
|------|---------|
| `index.html` | App entry, references `einkgram.webmanifest` |
| `einkgram.webmanifest` | PWA manifest (name, icons, theme) |
| `service.worker-*.js` | Service worker for offline + cache |
| `index-*.js`, `index-*.css` | Hashed app bundles |
| `assets/`, `public/` | Static assets (images, sounds) |

GitHub Pages serves everything with the right MIME types
because the build is plain static files.

---

## Custom domain (optional)

If you want `einkgram.example.com` instead of
`YOUR_USER.github.io/einkgram`:

1. Add a `CNAME` file to `public/` (so it gets copied
   to `dist/`) with your domain on the first line.
2. In your DNS provider, point the domain to GitHub
   Pages (`185.199.108.153` etc. or a CNAME to
   `YOUR_USER.github.io`).
3. In repo Settings → Pages → Custom domain: enter your
   domain. Enable "Enforce HTTPS" (requires the DNS to
   resolve first; may take a few minutes).

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

- **Push notifications** (Telegram-tt supports them) need
  VAPID keys. Not configured by default; we don't need
  them for an E-Ink device (the user is actively looking
  at it).
- **Background sync** (Telegram-tt uses it for sending
  messages while offline) is supported by the service
  worker but unreliable on Android WebView. Out of scope
  for v0.6.
- **App shortcuts** (the "Saved Messages" shortcut in
  the manifest) require Android 7.1+; older BOOX OS
  versions ignore them silently.

---

## Troubleshooting

**Build fails on "Cannot find module 'gramjs'"**
→ Run `npm ci` in `src/` not the project root.

**Page loads but Telegram login fails**
→ Check that `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` are
  set in the build environment. The first screen asks for
  a phone number, then a verification code.

**"Add to Home Screen" doesn't show up**
→ Some E-Ink browsers (especially older BOOX firmware)
  hide the PWA install banner. Try the browser's menu
  directly. Or bookmark the URL and add it to the home
  screen as a regular bookmark (works but no standalone
  mode).

**Service worker doesn't cache the app**
→ Service workers require HTTPS (we have it on Pages)
  and a same-origin scope. If you're testing on
  `http://192.168.x.x:1235` (Vite dev), the SW won't
  register. Test on the deployed URL.

---

## Next steps after deploy

1. Test on your E-Ink device; report any visual glitches.
2. Set up auto-updates: the service worker checks for
   new versions on every page load.
3. If the app works well, publish the repo to make it
   easy for other E-Ink users to fork and run.

For Einkgram's actual GitHub repo, see
<https://github.com/Einkgram/Einkgram> (placeholder; the
real URL is wherever the upstream user pushes it).
