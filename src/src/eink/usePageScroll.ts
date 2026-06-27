// Einkgram — Page scroll hook (v0.4.2)
//
// Finds the messages container at runtime and exposes up/down page
// scroll. We don't import from MessageListContent (red zone); we
// discover the container via the stable class name
// `messages-container` that upstream renders.
//
// The hook polls for the container every 500ms in case the
// container is mounted/unmounted during chat switches. Once found,
// it caches the ref so subsequent calls are cheap.
//
// Green zone: no upstream imports.

import { useEffect, useRef } from '../lib/teact/teact';

const CONTAINER_SELECTOR = '.messages-container';
const POLL_INTERVAL_MS = 500;

export type ScrollDirection = 'up' | 'down';

export function usePageScroll(scrollFraction = 0.9) {
  const containerRef = useRef<HTMLElement | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  // Poll for the messages container; cache it once found.
  useEffect(() => {
    function findContainer() {
      if (containerRef.current && document.contains(containerRef.current)) {
        return; // still attached
      }
      const el = document.querySelector(CONTAINER_SELECTOR);
      if (el instanceof HTMLElement) {
        containerRef.current = el;
      }
    }
    findContainer();
    pollTimerRef.current = window.setInterval(findContainer, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current !== null) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  /**
   * Page-scroll the messages container by `scrollFraction` of its
   * clientHeight in the given direction. Returns true if the
   * container was found and scrolled; false otherwise.
   */
  function pageScroll(direction: ScrollDirection): boolean {
    const el = containerRef.current;
    if (!el) return false;
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
    return containerRef.current;
  }

  return { pageScroll, getContainer };
}
