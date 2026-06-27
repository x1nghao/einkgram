// Einkgram — Image processor installer (extracted from init.ts in v0.5.4)
//
// Installs the global MutationObserver that watches for new
// <img> elements appearing in the DOM (chat switches, infinite
// scroll). It applies panel-aware dithering in place.
//
// This module is the SOLE writer of window.__eink.setPanel /
// .getPanel / .reprocessImages — eliminating the race that
// existed in v0.5.3 where autoProcess.ts would also write to
// window.__eink.

import { getActivePanel, setActivePanel, type PanelType } from '../panels';
import { installAutoProcessor } from '../autoProcess';

type EinkDevApi = Record<string, unknown>;

function getApi(): EinkDevApi {
  // init.ts may not have run yet (timing of import order). Be safe.
  const w = window as unknown as { __eink?: EinkDevApi };
  if (!w.__eink) w.__eink = {};
  return w.__eink;
}

export function installImageProcessor(): void {
  // Make sure the active panel CSS property is in sync with
  // whatever the user has stored. This is what panels.ts reads
  // when the image processor dispatches to an algorithm.
  const panel = getActivePanel();
  document.documentElement.style.setProperty('--eink-panel-type', panel);

  // Install the global observer. Returns an API we own.
  const autoApi = installAutoProcessor();

  // Expose panel control on the dev API. Single source of truth.
  // We do this in this module (not in autoProcess) so that
  // any future caller of window.__eink.setPanel gets our
  // wrapper (which also persists the choice to localStorage).
  const api = getApi();
  api.reprocessImages = autoApi.reprocessImages;
  api.activeImagePanel = autoApi.activeImagePanel;
  api.setPanel = (p: PanelType) => {
    setActivePanel(p);
    document.documentElement.style.setProperty('--eink-panel-type', p);
    autoApi.setPanel(p);
    return autoApi.reprocessImages(p);
  };
  api.getPanel = () => getActivePanel();
  api.allPanels = () => ['1bit', '4gray', '16gray', '256gray', 'color-4096', 'color-30000'];
}
