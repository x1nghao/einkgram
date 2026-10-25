// Einkgram — Wallpaper detection tests (v0.19)

import { beforeEach, describe, expect, it } from 'vitest';

// We test the detection logic indirectly by simulating DOM states.
// The module uses MutationObserver, so we test the scan function
// via the side effect of data-eink-role being stamped.
import { startWallpaperDetection } from './init/wallpaperDetect';

beforeEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-eink-role');
});

describe('wallpaperDetect', () => {
  it('stamps element with --custom-background style', () => {
    const el = document.createElement('div');
    el.style.cssText = '--custom-background: url(https://example.com/bg.jpg)';
    document.body.appendChild(el);

    startWallpaperDetection();

    expect(el.getAttribute('data-eink-role')).toBe('wallpaper');
  });

  it('stamps wallpaper child of #Main with background-image', () => {
    const main = document.createElement('div');
    main.id = 'Main';

    const bg = document.createElement('div');
    bg.style.cssText = 'position: absolute; background-image: url(pattern.png);';
    main.appendChild(bg);
    document.body.appendChild(main);

    startWallpaperDetection();

    expect(bg.getAttribute('data-eink-role')).toBe('wallpaper');
  });

  it('does not stamp regular content elements', () => {
    const main = document.createElement('div');
    main.id = 'Main';

    const content = document.createElement('div');
    content.style.cssText = 'position: relative;';
    content.textContent = 'Hello';
    main.appendChild(content);
    document.body.appendChild(main);

    startWallpaperDetection();

    expect(content.hasAttribute('data-eink-role')).toBe(false);
  });

  it('does not double-stamp already-tagged elements', () => {
    const el = document.createElement('div');
    el.style.cssText = '--custom-background: url(bg.jpg)';
    el.setAttribute('data-eink-role', 'wallpaper');
    document.body.appendChild(el);

    startWallpaperDetection();

    // Still has the attribute, no error thrown.
    expect(el.getAttribute('data-eink-role')).toBe('wallpaper');
  });
});
