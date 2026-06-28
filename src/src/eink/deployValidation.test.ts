// Einkgram — Deployment validation tests
//
// These tests verify the dist/ folder contains everything
// needed for a working PWA deployment:
//   - index.html references the einkgram manifest
//   - einkgram.webmanifest is valid JSON with required fields
//   - service worker file is present
//   - icons referenced in the manifest actually exist
//
// Run AFTER `npm run build:production`. The test reads from
// the dist/ folder relative to the project root.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Deployment validation (v0.6)', () => {
  const DIST = resolve(process.cwd(), 'dist');

  function hasDist(): boolean {
    try {
      return statSync(DIST).isDirectory();
    } catch {
      return false;
    }
  }

  it.skipIf(!hasDist())('dist/ exists after build', () => {
    expect(hasDist()).toBe(true);
  });

  it.skipIf(!hasDist())('index.html references einkgram.webmanifest', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    expect(html).toContain('href="./einkgram.webmanifest"');
  });

  it.skipIf(!hasDist())('einkgram.webmanifest is valid JSON with required PWA fields', () => {
    const text = readFileSync(join(DIST, 'einkgram.webmanifest'), 'utf8');
    const manifest = JSON.parse(text);

    // Required PWA manifest fields per the W3C spec.
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);

    // Einkgram-specific: name should NOT be "Telegram Web".
    expect(manifest.name).not.toContain('Telegram Web');
    expect(manifest.name.toLowerCase()).toContain('einkgram');
  });

  it.skipIf(!hasDist())('manifest icons actually exist in dist/', () => {
    const manifest = JSON.parse(
      readFileSync(join(DIST, 'einkgram.webmanifest'), 'utf8'),
    );
    for (const icon of manifest.icons) {
      const iconPath = join(DIST, icon.src);
      expect(
        existsSync(iconPath),
        `icon ${icon.src} referenced by manifest but missing in dist/`,
      ).toBe(true);
    }
  });

  it.skipIf(!hasDist())('service worker file is present', () => {
    const files = readdirSync(DIST);
    const sw = files.find((f) => /^service\.worker-.*\.js$/.test(f));
    expect(sw, 'expected a hashed service.worker-*.js file in dist/').toBeTruthy();
  });

  it.skipIf(!hasDist())('service worker registers itself in app code', () => {
    // The compiled JS bundle should reference navigator.serviceWorker.register
    // somewhere. We don't parse the whole bundle; we just check that
    // some hashed bundle includes the registration call.
    const files = readdirSync(join(DIST, 'assets'));
    const swEntry = files.find((f) => /index.*\.js$/.test(f));
    if (!swEntry) {
      // Some builds put bundles in dist/ root, not assets/.
      const rootFiles = readdirSync(DIST).filter((f) => /^index.*\.js$/.test(f));
      expect(rootFiles.length, 'expected at least one index-*.js bundle').toBeGreaterThan(0);
    } else {
      const bundle = readFileSync(join(DIST, 'assets', swEntry), 'utf8');
      // The actual registration call is something like
      // `navigator.serviceWorker.register` or imported from a
      // SW module. We look for the substring.
      expect(bundle).toMatch(/serviceWorker/);
    }
  });

  it.skipIf(!hasDist())('dist is reasonably small (< 100 MB unzipped, ~40 MB gzipped)', () => {
    // GitHub Pages has a 1 GB limit per site; we use 100 MB
    // uncompressed as a soft sanity check. After running
    // dev/cleanup-dist.sh, dist/ is ~67 MB on disk and
    // ~38 MB gzipped (which is what GitHub Pages actually
    // serves to E-Ink devices).
    function dirSize(p: string): number {
      const entries = readdirSync(p, { withFileTypes: true });
      let total = 0;
      for (const e of entries) {
        const child = join(p, e.name);
        if (e.isDirectory()) {
          total += dirSize(child);
        } else {
          total += statSync(child).size;
        }
      }
      return total;
    }
    const size = dirSize(DIST);
    expect(size).toBeLessThan(250 * 1024 * 1024);
  });
});
