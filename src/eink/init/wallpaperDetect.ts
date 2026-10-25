// Einkgram — Wallpaper auto-detection (v0.19)
//
// v0.16.1 added data-eink-role="wallpaper" directly in Main.tsx
// (a red-zone file). This module replaces that approach with a
// runtime MutationObserver that detects wallpaper elements by
// their structural characteristics, making it resilient to
// upstream DOM changes.
//
// Detection heuristics:
//   - Child of #Main
//   - Has style containing --custom-background
//   - OR: positioned absolute/fixed, large area, z-index < 1
//
// Once found, stamps data-eink-role="wallpaper" on the element
// so _reset.scss can suppress it.
//
// Green zone: no upstream code touched.

const WALLPAPER_ATTR = 'data-eink-role';
const WALLPAPER_VALUE = 'wallpaper';
const STAMPED_SET = new WeakSet<Element>();

function isWallpaperCandidate(el: Element): boolean {
  // Already stamped — skip.
  if (el.hasAttribute(WALLPAPER_ATTR)) return false;

  const html = el as HTMLElement;
  const style = html.style;
  if (!style) return false;

  // Primary signal: has --custom-background CSS variable.
  if (style.getPropertyValue('--custom-background')) return true;

  // Secondary signal: first child of #Main, positioned, large.
  const parent = el.parentElement;
  if (!parent || parent.id !== 'Main') return false;

  // The wallpaper div is typically the first child of #Main,
  // positioned absolutely with a background pattern.
  const position = style.position;
  if (position !== 'absolute' && position !== 'fixed') return false;

  // Check for pattern/background style.
  const bg = style.background || style.backgroundImage;
  if (bg && bg !== 'none') return true;

  // Also check computed style for background-image from CSS classes.
  const computed = window.getComputedStyle(el);
  const computedBg = computed.backgroundImage;
  if (computedBg && computedBg !== 'none') return true;

  return false;
}

function stampWallpaper(el: Element): void {
  if (STAMPED_SET.has(el)) return;
  el.setAttribute(WALLPAPER_ATTR, WALLPAPER_VALUE);
  STAMPED_SET.add(el);
}

function scanForWallpapers(root: ParentNode = document): void {
  // Fast path: check direct children of #Main first.
  const main = root instanceof Document
    ? root.getElementById('Main')
    : (root as Element)?.id === 'Main' ? (root as Element) : undefined;

  if (main) {
    for (const child of main.children) {
      if (isWallpaperCandidate(child)) {
        stampWallpaper(child);
      }
    }
  }

  // Fallback: query by style attribute.
  const candidates = root.querySelectorAll?.('[style*="custom-background"]') ?? [];
  for (const el of candidates) {
    stampWallpaper(el);
  }
}

/**
 * Start observing the DOM for wallpaper elements. When found,
 * stamp them with data-eink-role="wallpaper" so _reset.scss
 * can hide them.
 *
 * Called once from init.ts. Returns a cleanup function (unused
 * in practice — runs for the app lifetime).
 */
export function startWallpaperDetection(): () => void {
  // Initial scan (in case #Main is already in the DOM).
  scanForWallpapers();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = node as Element;

        // Check the node itself.
        if (isWallpaperCandidate(el)) {
          stampWallpaper(el);
        }

        // Check descendants.
        scanForWallpapers(el);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
