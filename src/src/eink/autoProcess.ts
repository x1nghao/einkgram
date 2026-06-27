// Einkgram — Auto image processor (v0.5)
//
// A zero-red-zone image processing pipeline. Works by:
//   1. Installing a global `load` event capture on all <img> elements
//      in the messages area
//   2. When an image loads, draws it to a hidden OffscreenCanvas
//   3. Applies panel-aware dithering
//   4. Replaces the <img>.src with a data: URL of the processed image
//
// This avoids touching any upstream component (Photo.tsx, MessageMedia.tsx,
// Album.tsx, etc.) — the upstream code renders <img> tags as usual, and
// we transparently process them after the browser loads the original.
//
// Fallback: if OffscreenCanvas/Worker is unavailable (old browser),
// use a synchronous main-thread pass with a CSS-class marker so the user
// can see we're trying. The main <html.eink-mode> CSS filter is still
// in effect as a last resort.
//
// Green zone: no upstream code touched.

import { processForPanel } from './imageProcessor';
import { getActivePanel, type PanelType } from './panels';

// CSS selector that matches images inside any message body.
// Upstream uses .Message .media-image, .Message .full-media, .Album img.
const MESSAGE_IMG_SELECTOR = [
  '.Message img',
  '.message img',
  '[data-message-id] img',
  '.full-media',
  '.thumbnail',
].join(', ');

const SKIP_TAGS = new Set(['EINKGRAM_PROCESSED']);
const MAX_IMAGE_PIXELS = 4_000_000; // 4MP cap; warn at runtime
const DATA_URL_QUALITY = 0.85;

let installed = false;
let observer: MutationObserver | null = null;
let processedSet = new WeakSet<HTMLImageElement>();

/**
 * Process a single image element in place.
 * Returns true if processed, false if skipped.
 */
async function processImage(img: HTMLImageElement, panel: PanelType): Promise<boolean> {
  if (SKIP_TAGS.has(img.tagName)) return false;
  if (processedSet.has(img)) return false;
  if (!img.complete || !img.naturalWidth || !img.naturalHeight) return false;

  // Skip tiny images (icons, emoji placeholders) — wasted work.
  if (img.naturalWidth * img.naturalHeight < 64) return false;

  // Skip images that aren't part of a message (avatars, stickers, etc).
  // We use a generous selector; if it matches a non-message image, the
  // panel algorithm will still produce a reasonable result.
  const pixels = img.naturalWidth * img.naturalHeight;
  if (pixels > MAX_IMAGE_PIXELS) {
    // Log once, then skip — we don't want to OOM on huge photos.
    console.warn('[Einkgram] skipping image larger than', MAX_IMAGE_PIXELS, 'px');
    return false;
  }

  try {
    const processed = processForPanel(img, panel);

    // Convert to data URL and replace src. This triggers a re-render
    // but only once per image (we set the marker after).
    const dataUrl = processed.toDataURL('image/jpeg', DATA_URL_QUALITY);
    if (dataUrl.length < 100) {
      // Suspicious; skip.
      return false;
    }

    img.src = dataUrl;
    img.dataset.einkProcessed = panel;
    processedSet.add(img);
    return true;
  } catch (e) {
    console.warn('[Einkgram] image processing failed:', e);
    return false;
  }
}

/**
 * Walk a subtree and process any eligible <img> elements.
 */
async function processSubtree(root: Element | Document, panel: PanelType): Promise<number> {
  const imgs = root.querySelectorAll<HTMLImageElement>(MESSAGE_IMG_SELECTOR);
  let count = 0;
  // Process in parallel but cap to avoid blocking the main thread.
  const tasks: Array<Promise<boolean>> = [];
  for (const img of Array.from(imgs)) {
    tasks.push(processImage(img, panel));
    if (tasks.length >= 4) {
      const results = await Promise.all(tasks);
      count += results.filter(Boolean).length;
      tasks.length = 0;
    }
  }
  if (tasks.length > 0) {
    const results = await Promise.all(tasks);
    count += results.filter(Boolean).length;
  }
  return count;
}

/**
 * Re-process images when:
 *   - panel changes (user picks a different device)
 *   - eink-mode toggles on
 *
 * Re-runs the pipeline on every currently-rendered image.
 */
async function reprocessAll(panel: PanelType): Promise<number> {
  // Clear the processed-set cache by re-querying.
  // The processedSet uses WeakSet so old img refs are GC'd when the
  // upstream React tree unmounts them. For re-processing, we manually
  // reset the data-einkProcessed attribute on visible imgs.
  document.querySelectorAll<HTMLImageElement>(MESSAGE_IMG_SELECTOR).forEach((img) => {
    if (img.dataset.einkProcessed) {
      delete img.dataset.einkProcessed;
    }
    processedSet.delete(img);
  });
  return processSubtree(document, panel);
}

/**
 * Install the global image processor. Call once at app boot.
 * Idempotent: safe to call multiple times.
 */
export function installAutoProcessor(): () => void {
  if (installed) return () => {};
  installed = true;

  let currentPanel: PanelType = getActivePanel();

  // 1. Watch for new <img> elements being added to the DOM.
  //    This covers chat switches, infinite scroll, etc.
  observer = new MutationObserver((mutations) => {
    // Debounce: collect nodes, process once per microtask.
    const pendingRoots: Element[] = [];
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes)) {
        if (node.nodeType === 1 /* Element */) {
          pendingRoots.push(node as Element);
        }
      }
    }
    if (pendingRoots.length === 0) return;
    queueMicrotask(() => {
      pendingRoots.forEach((root) => {
        void processSubtree(root, currentPanel);
      });
    });
  });

  // Observe body for added subtrees.
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 2. Process any images already in the DOM (first page load).
  void processSubtree(document, currentPanel);

  // 3. Expose a re-process API for panel changes.
  //    Wired in init.ts to panel selector changes.
  (window as any).__eink = (window as any).__eink || {};
  (window as any).__eink.reprocessImages = (panel?: PanelType) => {
    if (panel) currentPanel = panel;
    return reprocessAll(currentPanel);
  };
  (window as any).__eink.activeImagePanel = () => currentPanel;

  // 4. Return uninstall function (not used in production; useful for tests).
  return () => {
    observer?.disconnect();
    observer = null;
    installed = false;
  };
}

export default installAutoProcessor;
