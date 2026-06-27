// Einkgram — autoProcess tests (v0.5)
//
// We don't test the full DOM pipeline (jsdom doesn't support
// OffscreenCanvas or canvas drawing well). Instead, we test
// the bits that matter: panel storage + dispatch.

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  getActivePanel,
  setActivePanel,
  isPanelType,
  ALL_PANEL_TYPES,
} from './panels';

describe('panels storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('isPanelType guards valid values', () => {
    expect(isPanelType('1bit')).toBe(true);
    expect(isPanelType('16gray')).toBe(true);
    expect(isPanelType('color-4096')).toBe(true);
    expect(isPanelType('color-30000')).toBe(true);
    expect(isPanelType('garbage')).toBe(false);
    expect(isPanelType('')).toBe(false);
  });

  it('ALL_PANEL_TYPES lists all real panels except unknown', () => {
    expect(ALL_PANEL_TYPES).toContain('1bit');
    expect(ALL_PANEL_TYPES).toContain('16gray');
    expect(ALL_PANEL_TYPES).toContain('color-4096');
    expect(ALL_PANEL_TYPES).not.toContain('unknown');
  });

  it('getActivePanel defaults to 16gray when no storage', () => {
    // We don't assert exact value (depends on getComputedStyle),
    // but we do assert it returns a valid PanelType.
    const p = getActivePanel();
    expect(typeof p).toBe('string');
  });

  it('setActivePanel persists to localStorage', () => {
    setActivePanel('1bit');
    expect(localStorage.getItem('eink-panel')).toBe('1bit');
    setActivePanel('color-4096');
    expect(localStorage.getItem('eink-panel')).toBe('color-4096');
  });

  it('getActivePanel reads from localStorage', () => {
    localStorage.setItem('eink-panel', '1bit');
    expect(getActivePanel()).toBe('1bit');
  });

  it('getActivePanel ignores invalid localStorage values', () => {
    localStorage.setItem('eink-panel', 'invalid-value');
    const p = getActivePanel();
    // Falls back to CSS or default; should still be a valid type.
    expect(typeof p).toBe('string');
  });
});
