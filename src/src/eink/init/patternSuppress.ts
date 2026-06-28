// Einkgram — Pattern background suppression (v0.9.2)
//
// CSS Module hashes the `backgroundStyles` class at build time,
// so we cannot match it with a static CSS selector (e.g.
// `[class*="patternBackground"]` doesn't match `Y7owXZmb`).
//
// Instead, we watch the DOM with a MutationObserver and scan
// new subtrees for elements whose `::before` pseudo-element has
// `pattern` in its `background-image`. When we find one, we
// add `data-eink-no-pattern`; the CSS rule in `_reset.scss`
// then hides the `::before` on that element.
//
// This approach survives any CSS-module hash change and works
// regardless of where upstream decides to put the pattern div.
//
// Green zone: no upstream code touched.

const SELECTOR_HINT = '.middle-column-content, #MiddleColumn';
const PATTERN_KEYWORD = 'pattern';
const MARKER_ATTR = 'data-eink-no-pattern';

let observer: MutationObserver | null = null;
let pendingRaf = 0;

function scanTree(root: Element) {
  // If the root itself matches, scan it.
  if (hasPatternBefore(root)) {
    root.setAttribute(MARKER_ATTR, '');
    return; // once applied, skip children
  }

  // Walk direct children and their subtrees.
  root.querySelectorAll('*').forEach((el) => {
    if (hasPatternBefore(el)) {
      el.setAttribute(MARKER_ATTR, '');
    }
  });
}

function hasPatternBefore(el: Element): boolean {
  try {
    const style = getComputedStyle(el, '::before');
    return style.backgroundImage.toLowerCase().includes(PATTERN_KEYWORD);
  } catch {
    return false;
  }
}

function onMutation(mutations: MutationRecord[]) {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node instanceof Element) {
        if (pendingRaf) cancelAnimationFrame(pendingRaf);
        pendingRaf = requestAnimationFrame(() => {
          pendingRaf = 0;
          scanTree(node);
        });
      }
    }
  }
}

export function installPatternSuppress() {
  if (observer) return;

  // Scan existing DOM.
  const existing = document.querySelector(SELECTOR_HINT);
  if (existing) scanTree(existing);

  // Watch for new pattern divs (e.g. on chat switch).
  observer = new MutationObserver(onMutation);
  observer.observe(document.body, { childList: true, subtree: true });
}

export function uninstallPatternSuppress() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
