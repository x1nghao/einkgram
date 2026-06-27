// Einkgram — Page scroll hook (v0.7 audit fix)
//
// Finds the messages container at runtime and exposes up/down page
// scroll. We don't import from MessageListContent (red zone); we
// discover the container via the stable class name
// `messages-container` that upstream renders.
//
// v0.7 audit fix: replaced 500ms `setInterval` polling with a
// MutationObserver. The interval ran forever even when the
// container was stable, wasting battery on E-Ink devices. The
// observer only fires when the DOM actually changes (chat
// switch, modal open, etc.), which is the only case where
// the container ref would be stale.
//
// Green zone: no upstream imports.

import { useEffect, useRef } from '../lib/teact/teact';

const CONTAINER_SELECTOR = '.messages-container';

export type ScrollDirection = 'up' | 'down';

export function usePageScroll(scrollFraction = 0.9) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function findContainer(): HTMLElement | null {
      // Re-resolve if the previous ref is detached.
      if (
        containerRef.current
        && containerRef.current.isConnected
        && document.contains(containerRef.current)
      ) {
        return containerRef.current;
      }
      const el = document.querySelector(CONTAINER_SELECTOR);
      if (el instanceof HTMLElement) {
        containerRef.current = el;
        return el;
      }
      containerRef.current = null;
      return null;
    }

    // Initial lookup.
    findContainer();

    // Observe the document body for childList / subtree changes.
    // Chat switches tear down and rebuild the messages container;
    // the observer fires once per switch, not every 500ms.
    // `attributes: false` — we don't care about style/class changes
    // on the container; we only care if it gets re-created.
    const observer = new MutationObserver(() => {
      // Cheap re-check; only the rare case (chat switch) reaches here.
      findContainer();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /**
   * Page-scroll the messages container by `scrollFraction` of its
   * clientHeight in the given direction. Returns true if the
   * container was found and scrolled; false otherwise.
   */
  function pageScroll(direction: ScrollDirection): boolean {
    const el = containerRef.current;
    if (!el || !el.isConnected) return false;
    const distance = el.clientHeight * scrollFraction;
    const delta = direction === 'down' ? distance : -distance;
    el.scrollBy({ top: delta, behavior: 'auto' });
    return true;
  }

  /**
   * The current scrollable container, or null if not yet found.
   * (Exposed for the UI to show/hide the buttons based on availability.)
   */
  function getContainer(): HTMLElement | null {
    if (containerRef.current && containerRef.current.isConnected) {
      return containerRef.current;
    }
    return null;
  }

  return { pageScroll, getContainer };
}
