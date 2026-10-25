// Einkgram — Reader mode tests (v0.19)
//
// Mirrors fontWeight.test.ts structure.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_READER_MODE,
  READER_MODE_ATTR,
  READER_MODE_CYCLE,
  READER_MODE_STORAGE_KEY,
} from './constants';
import {
  applyInitialReaderMode,
  applyReaderModeToDom,
  cycleReaderMode,
  isReaderMode,
  readReaderModeFromDom,
  readStoredReaderMode,
  writeStoredReaderMode,
} from './readerMode';

// ── Mock localStorage ──────────────────────────────────
const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal('localStorage', {
    // localStorage.getItem returns null for missing keys per the DOM spec
    // eslint-disable-next-line no-null/no-null
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  });
  document.documentElement.removeAttribute(READER_MODE_ATTR);
});

// ── Mock localStorage ──────────────────────────────────
describe('isReaderMode', () => {
  it('accepts "on" and "off"', () => {
    expect(isReaderMode('on')).toBe(true);
    expect(isReaderMode('off')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isReaderMode('enabled')).toBe(false);
    expect(isReaderMode(undefined)).toBe(false);
    expect(isReaderMode(1)).toBe(false);
  });
});

describe('readStoredReaderMode', () => {
  it('returns default when unset', () => {
    expect(readStoredReaderMode()).toBe(DEFAULT_READER_MODE);
  });

  it('returns stored "on"', () => {
    store[READER_MODE_STORAGE_KEY] = 'on';
    expect(readStoredReaderMode()).toBe('on');
  });

  it('returns stored "off"', () => {
    store[READER_MODE_STORAGE_KEY] = 'off';
    expect(readStoredReaderMode()).toBe('off');
  });

  it('falls back on invalid value', () => {
    store[READER_MODE_STORAGE_KEY] = 'garbage';
    expect(readStoredReaderMode()).toBe(DEFAULT_READER_MODE);
  });
});

describe('writeStoredReaderMode', () => {
  it('persists "on"', () => {
    writeStoredReaderMode('on');
    expect(store[READER_MODE_STORAGE_KEY]).toBe('on');
  });

  it('persists "off"', () => {
    writeStoredReaderMode('off');
    expect(store[READER_MODE_STORAGE_KEY]).toBe('off');
  });
});

describe('applyReaderModeToDom', () => {
  it('sets attribute to "on" when on', () => {
    applyReaderModeToDom('on');
    expect(document.documentElement.getAttribute(READER_MODE_ATTR)).toBe('on');
  });

  it('removes attribute when off', () => {
    document.documentElement.setAttribute(READER_MODE_ATTR, 'on');
    applyReaderModeToDom('off');
    expect(document.documentElement.hasAttribute(READER_MODE_ATTR)).toBe(false);
  });
});

describe('readReaderModeFromDom', () => {
  it('reads "on" from attribute', () => {
    document.documentElement.setAttribute(READER_MODE_ATTR, 'on');
    expect(readReaderModeFromDom()).toBe('on');
  });

  it('returns default when no attribute', () => {
    expect(readReaderModeFromDom()).toBe(DEFAULT_READER_MODE);
  });
});

describe('cycleReaderMode', () => {
  it('cycles through all modes', () => {
    let mode = READER_MODE_CYCLE[0];
    const visited: string[] = [mode];
    for (let i = 0; i < READER_MODE_CYCLE.length; i++) {
      mode = cycleReaderMode(mode);
      visited.push(mode);
    }
    // After full cycle, back to start.
    expect(mode).toBe(READER_MODE_CYCLE[0]);
  });

  it('wraps from last to first', () => {
    const last = READER_MODE_CYCLE[READER_MODE_CYCLE.length - 1];
    expect(cycleReaderMode(last)).toBe(READER_MODE_CYCLE[0]);
  });

  it('handles unknown input', () => {
    expect(cycleReaderMode('garbage' as never)).toBe(READER_MODE_CYCLE[0]);
  });
});

describe('applyInitialReaderMode', () => {
  it('applies stored "on" to DOM', () => {
    store[READER_MODE_STORAGE_KEY] = 'on';
    applyInitialReaderMode();
    expect(document.documentElement.getAttribute(READER_MODE_ATTR)).toBe('on');
  });

  it('applies default (off) when unset', () => {
    applyInitialReaderMode();
    expect(document.documentElement.hasAttribute(READER_MODE_ATTR)).toBe(false);
  });
});
