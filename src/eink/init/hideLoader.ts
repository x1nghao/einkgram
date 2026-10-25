// Einkgram — Hide the pre-React loading screen (v0.9)
//
// In v0.9 we added a static loading screen to index.html so
// users (especially E-Ink users) see a "Loading Einkgram…"
// message + progress bar from the very first frame, instead
// of the dark background + rotating spinner that the upstream
// app shell would show during boot.
//
// This function hides that loading screen once React has
// mounted and the user can see the real UI. The hide is
// instant (no transition, no fade) to avoid E-Ink ghosting.
//
// Green zone: no upstream code touched.

const LOADER_ID = 'eink-loading-screen';

export function hideEinkLoader(): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(LOADER_ID);
  if (!el) return;
  // Remove the element entirely. setProperty('display','none')
  // would also work, but `remove()` frees the DOM node and
  // is unambiguously safe (no chance of style override).
  el.remove();
}
