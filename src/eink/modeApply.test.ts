// Einkgram — Core E-Ink module unit tests (v0.17)
//
// Tests for modeApply.ts (mode application utilities) and
// constants.ts (type/value definitions). These functions are
// the critical path for E-Ink mode ON/OFF — if they break,
// the entire E-Ink feature silently fails.
//
// Green zone: test file, no upstream code touched.

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CLASS_EINK,
  DEFAULT_EINK_MODE,
  EINK_MODE_CYCLE_ORDER,
  EINK_MODE_LABELS,
  EINK_MODE_STORAGE_KEY,
  type EinkMode,
} from './constants';
// Since we're testing pure functions that access localStorage
// and document, vitest's jsdom environment handles that.
import {
  applyModeToDom,
  cycleMode,
  isEinkMode,
  readModeFromDom,
  readStoredMode,
  writeStoredMode,
} from './modeApply';

// ─── Helpers ──────────────────────────────────────────────

function resetDom() {
  document.documentElement.className = '';
}

function resetStorage() {
  localStorage.clear();
}

// ─── constants.ts ─────────────────────────────────────────

describe('constants', () => {
  it('DEFAULT_EINK_MODE is "on"', () => {
    expect(DEFAULT_EINK_MODE).toBe('on');
  });

  it('CLASS_EINK is "eink-mode"', () => {
    expect(CLASS_EINK).toBe('eink-mode');
  });

  it('EINK_MODE_STORAGE_KEY is "eink-mode"', () => {
    expect(EINK_MODE_STORAGE_KEY).toBe('eink-mode');
  });

  it('EINK_MODE_LABELS has human-readable labels for both modes', () => {
    expect(EINK_MODE_LABELS).toEqual({ off: 'Off', on: 'On' });
  });

  it('EINK_MODE_CYCLE_ORDER alternates off → on', () => {
    expect(EINK_MODE_CYCLE_ORDER).toEqual(['off', 'on']);
  });
});

// ─── isEinkMode ───────────────────────────────────────────

describe('isEinkMode', () => {
  it('accepts "off"', () => {
    expect(isEinkMode('off')).toBe(true);
  });

  it('accepts "on"', () => {
    expect(isEinkMode('on')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isEinkMode('')).toBe(false);
  });

  it('rejects invalid string', () => {
    expect(isEinkMode('standard')).toBe(false);
    expect(isEinkMode('1bit')).toBe(false);
    expect(isEinkMode('paper')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isEinkMode(undefined)).toBe(false);
    expect(isEinkMode(1)).toBe(false);
    expect(isEinkMode({})).toBe(false);
  });
});

// ─── readStoredMode / writeStoredMode ─────────────────────

describe('readStoredMode', () => {
  afterEach(resetStorage);

  it('returns DEFAULT_EINK_MODE when localStorage is empty', () => {
    expect(readStoredMode()).toBe('on');
  });

  it('returns "off" when stored', () => {
    localStorage.setItem(EINK_MODE_STORAGE_KEY, 'off');
    expect(readStoredMode()).toBe('off');
  });

  it('returns "on" when stored', () => {
    localStorage.setItem(EINK_MODE_STORAGE_KEY, 'on');
    expect(readStoredMode()).toBe('on');
  });

  it('returns DEFAULT_EINK_MODE when stored value is invalid', () => {
    localStorage.setItem(EINK_MODE_STORAGE_KEY, 'garbage');
    expect(readStoredMode()).toBe('on');
  });

  it('returns DEFAULT_EINK_MODE when stored value is null', () => {
    localStorage.setItem(EINK_MODE_STORAGE_KEY, 'null');
    expect(readStoredMode()).toBe('on');
  });
});

describe('writeStoredMode', () => {
  afterEach(resetStorage);

  it('persists the mode to localStorage', () => {
    writeStoredMode('off');
    expect(localStorage.getItem(EINK_MODE_STORAGE_KEY)).toBe('off');

    writeStoredMode('on');
    expect(localStorage.getItem(EINK_MODE_STORAGE_KEY)).toBe('on');
  });

  it('silently ignores errors (e.g. quota exceeded)', () => {
    // Simulate storage error
    const original = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    expect(() => writeStoredMode('on')).not.toThrow();

    localStorage.setItem = original;
  });
});

// ─── applyModeToDom / readModeFromDom ─────────────────────

describe('applyModeToDom', () => {
  afterEach(resetDom);

  it('adds eink-mode class when mode is "on"', () => {
    applyModeToDom('on');
    expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(true);
  });

  it('removes eink-mode class when mode is "off"', () => {
    document.documentElement.classList.add(CLASS_EINK);
    applyModeToDom('off');
    expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(false);
  });

  it('is idempotent — repeated "on" keeps class', () => {
    applyModeToDom('on');
    applyModeToDom('on');
    expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(true);
  });

  it('is idempotent — repeated "off" keeps class absent', () => {
    applyModeToDom('off');
    applyModeToDom('off');
    expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(false);
  });

  it('does not disturb other html classes', () => {
    document.documentElement.className = 'notranslate theme-light';
    applyModeToDom('on');
    expect(document.documentElement.classList.contains('notranslate')).toBe(true);
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(true);
  });
});

describe('readModeFromDom', () => {
  afterEach(resetDom);

  it('returns "on" when eink-mode class is present', () => {
    document.documentElement.classList.add(CLASS_EINK);
    expect(readModeFromDom()).toBe('on');
  });

  it('returns "off" when eink-mode class is absent', () => {
    expect(readModeFromDom()).toBe('off');
  });

  it('returns "off" for an empty class list', () => {
    document.documentElement.className = '';
    expect(readModeFromDom()).toBe('off');
  });
});

// ─── cycleMode ────────────────────────────────────────────

describe('cycleMode', () => {
  it('cycles "off" → "on"', () => {
    expect(cycleMode('off')).toBe('on');
  });

  it('cycles "on" → "off"', () => {
    expect(cycleMode('on')).toBe('off');
  });

  it('handles unknown mode by returning first in cycle order', () => {
    // @ts-expect-error testing invalid input
    expect(cycleMode('unknown' as EinkMode)).toBe('off');
  });
});

// ─── Round-trip: DOM ↔ localStorage ──────────────────────

describe('round-trip', () => {
  afterEach(() => {
    resetDom();
    resetStorage();
  });

  it('stored mode survives write → read round-trip', () => {
    writeStoredMode('off');
    expect(readStoredMode()).toBe('off');
  });

  it('DOM mode survives apply → read round-trip', () => {
    applyModeToDom('on');
    expect(readModeFromDom()).toBe('on');
    applyModeToDom('off');
    expect(readModeFromDom()).toBe('off');
  });

  it('EinkMode type only has two valid values', () => {
    const all: EinkMode[] = ['off', 'on'];
    for (const m of all) {
      expect(isEinkMode(m)).toBe(true);
    }
  });
});
