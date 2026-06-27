// Einkgram — Tests for the consolidated mode helpers (v0.8)
//
// Before v0.8 the same logic lived in 3 files and was tested
// indirectly. Now it's a single module with a single test file.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyModeToDom,
  CLASS_1BIT,
  CLASS_EINK,
  CLASS_PAPER,
  cycleMode,
  isEinkMode,
  readModeFromDom,
  readStoredMode,
  writeStoredMode,
  DEFAULT_EINK_MODE,
  EINK_MODE_CYCLE_ORDER,
  EINK_MODE_STORAGE_KEY,
} from './modeApply';

describe('modeApply', () => {
  beforeEach(() => {
    // Reset DOM classes before each test
    document.documentElement.className = '';
    // Reset localStorage before each test
    try {
      localStorage.removeItem(EINK_MODE_STORAGE_KEY);
    } catch {
      // ignore
    }
  });

  afterEach(() => {
    document.documentElement.className = '';
  });

  describe('isEinkMode', () => {
    it('accepts all four modes', () => {
      expect(isEinkMode('off')).toBe(true);
      expect(isEinkMode('standard')).toBe(true);
      expect(isEinkMode('1bit')).toBe(true);
      expect(isEinkMode('paper')).toBe(true);
    });

    it('rejects other strings', () => {
      expect(isEinkMode('Standard')).toBe(false); // case-sensitive
      expect(isEinkMode('')).toBe(false);
      expect(isEinkMode(' auto ')).toBe(false);
      expect(isEinkMode('null')).toBe(false);
    });

    it('rejects non-strings', () => {
      expect(isEinkMode(null)).toBe(false);
      expect(isEinkMode(undefined)).toBe(false);
      expect(isEinkMode(42)).toBe(false);
      expect(isEinkMode({})).toBe(false);
    });
  });

  describe('applyModeToDom + readModeFromDom', () => {
    it('are inverses for all four modes', () => {
      for (const mode of ['off', 'standard', '1bit', 'paper'] as const) {
        applyModeToDom(mode);
        expect(readModeFromDom()).toBe(mode);
      }
    });

    it('off mode applies no classes', () => {
      applyModeToDom('off');
      expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(false);
      expect(document.documentElement.classList.contains(CLASS_1BIT)).toBe(false);
      expect(document.documentElement.classList.contains(CLASS_PAPER)).toBe(false);
    });

    it('standard mode applies only the base class', () => {
      applyModeToDom('standard');
      expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(true);
      expect(document.documentElement.classList.contains(CLASS_1BIT)).toBe(false);
      expect(document.documentElement.classList.contains(CLASS_PAPER)).toBe(false);
    });

    it('1bit mode applies base + 1bit class', () => {
      applyModeToDom('1bit');
      expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(true);
      expect(document.documentElement.classList.contains(CLASS_1BIT)).toBe(true);
      expect(document.documentElement.classList.contains(CLASS_PAPER)).toBe(false);
    });

    it('paper mode applies base + paper class', () => {
      applyModeToDom('paper');
      expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(true);
      expect(document.documentElement.classList.contains(CLASS_1BIT)).toBe(false);
      expect(document.documentElement.classList.contains(CLASS_PAPER)).toBe(true);
    });

    it('is idempotent (calling twice is the same as once)', () => {
      applyModeToDom('1bit');
      applyModeToDom('1bit');
      expect(readModeFromDom()).toBe('1bit');
    });

    it('cleans up classes when switching modes', () => {
      applyModeToDom('1bit');
      applyModeToDom('paper');
      expect(document.documentElement.classList.contains(CLASS_1BIT)).toBe(false);
      expect(document.documentElement.classList.contains(CLASS_PAPER)).toBe(true);

      applyModeToDom('off');
      expect(document.documentElement.classList.contains(CLASS_EINK)).toBe(false);
    });
  });

  describe('readStoredMode + writeStoredMode', () => {
    it('returns DEFAULT_EINK_MODE when nothing is stored', () => {
      expect(readStoredMode()).toBe(DEFAULT_EINK_MODE);
    });

    it('round-trips a stored value', () => {
      writeStoredMode('1bit');
      expect(readStoredMode()).toBe('1bit');
    });

    it('falls back to default when stored value is invalid', () => {
      localStorage.setItem(EINK_MODE_STORAGE_KEY, 'banana');
      expect(readStoredMode()).toBe(DEFAULT_EINK_MODE);
    });

    it('survives an invalid value being written', () => {
      // Simulate corruption by manually setting a bad value
      localStorage.setItem(EINK_MODE_STORAGE_KEY, '');
      expect(readStoredMode()).toBe(DEFAULT_EINK_MODE);
    });
  });

  describe('cycleMode', () => {
    it('cycles in EINK_MODE_CYCLE_ORDER', () => {
      const order = EINK_MODE_CYCLE_ORDER;
      // For each position i, cycleMode(order[i]) === order[(i+1) % len]
      for (let i = 0; i < order.length; i++) {
        expect(cycleMode(order[i])).toBe(order[(i + 1) % order.length]);
      }
    });

    it('starts at standard (not off) for fresh users', () => {
      // The cycle starts at 'standard' so a user pressing the
      // shortcut for the first time gets the E-Ink experience,
      // not 'off'. This is a UX choice, not a bug.
      expect(EINK_MODE_CYCLE_ORDER[0]).toBe('standard');
    });

    it('returns first item for unknown input', () => {
      // cycleMode('off') => '1bit' (next in order)
      // cycleMode('garbage') => EINK_MODE_CYCLE_ORDER[0]
      const result = cycleMode('garbage' as 'off');
      expect(result).toBe(EINK_MODE_CYCLE_ORDER[0]);
    });

    it('wraps around at the end of the cycle', () => {
      const order = EINK_MODE_CYCLE_ORDER;
      const last = order[order.length - 1];
      expect(cycleMode(last)).toBe(order[0]);
    });
  });

  describe('integration: read -> apply -> read round trip', () => {
    it('preserves a stored mode through DOM round-trip', () => {
      writeStoredMode('paper');
      // Read it back, apply to DOM, then read from DOM
      const stored = readStoredMode();
      applyModeToDom(stored);
      expect(readModeFromDom()).toBe('paper');
    });
  });
});
