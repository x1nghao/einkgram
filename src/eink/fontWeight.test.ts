// Einkgram — Font weight unit tests (v0.18)
//
// Green zone: tests for font weight utilities only.

import { beforeEach, describe, expect, it } from 'vitest';

import {
  applyFontWeightToDom,
  cycleFontWeight,
  FONT_WEIGHT_ATTR,
  type FontWeightLevel,
  isFontWeightLevel,
  readFontWeightFromDom,
  readStoredFontWeight,
  writeStoredFontWeight,
} from './fontWeight';

// ─── Helpers ──────────────────────────────────────────────

function resetDom() {
  document.documentElement.removeAttribute(FONT_WEIGHT_ATTR);
}

function resetStorage() {
  localStorage.clear();
}

// ─── Type guard ───────────────────────────────────────────

describe('isFontWeightLevel', () => {
  it('recognises all three valid levels', () => {
    const levels: FontWeightLevel[] = ['normal', 'medium', 'bold'];
    for (const l of levels) {
      expect(isFontWeightLevel(l)).toBe(true);
    }
  });

  it('rejects invalid strings', () => {
    expect(isFontWeightLevel('thin')).toBe(false);
    expect(isFontWeightLevel('black')).toBe(false);
    expect(isFontWeightLevel('')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isFontWeightLevel(undefined)).toBe(false);
    expect(isFontWeightLevel(0)).toBe(false);
    expect(isFontWeightLevel({})).toBe(false);
  });
});

// ─── localStorage ─────────────────────────────────────────

describe('readStoredFontWeight / writeStoredFontWeight', () => {
  beforeEach(resetStorage);

  it('returns "normal" as default when nothing is stored', () => {
    expect(readStoredFontWeight()).toBe('normal');
  });

  it('round-trips all three levels', () => {
    const levels: FontWeightLevel[] = ['normal', 'medium', 'bold'];
    for (const l of levels) {
      writeStoredFontWeight(l);
      expect(readStoredFontWeight()).toBe(l);
    }
  });
});

// ─── Cycle ────────────────────────────────────────────────

describe('cycleFontWeight', () => {
  it('normal → medium', () => expect(cycleFontWeight('normal')).toBe('medium'));
  it('medium → bold', () => expect(cycleFontWeight('medium')).toBe('bold'));
  it('bold → normal', () => expect(cycleFontWeight('bold')).toBe('normal'));

  it('wraps invalid input to start of cycle', () => {
    expect(cycleFontWeight('thin' as FontWeightLevel)).toBe('normal');
    expect(cycleFontWeight('' as FontWeightLevel)).toBe('normal');
  });
});

// ─── DOM apply / read ─────────────────────────────────────

describe('DOM apply / read', () => {
  beforeEach(resetDom);

  it('"normal" removes the attribute', () => {
    document.documentElement.setAttribute(FONT_WEIGHT_ATTR, 'bold');
    applyFontWeightToDom('normal');
    expect(document.documentElement.hasAttribute(FONT_WEIGHT_ATTR)).toBe(false);
  });

  it('"medium" sets data-eink-font-weight="medium"', () => {
    applyFontWeightToDom('medium');
    expect(document.documentElement.getAttribute(FONT_WEIGHT_ATTR)).toBe('medium');
  });

  it('"bold" sets data-eink-font-weight="bold"', () => {
    applyFontWeightToDom('bold');
    expect(document.documentElement.getAttribute(FONT_WEIGHT_ATTR)).toBe('bold');
  });

  it('readFontWeightFromDom returns "normal" when attr absent', () => {
    expect(readFontWeightFromDom()).toBe('normal');
  });

  it('readFontWeightFromDom returns "medium" when attr set', () => {
    document.documentElement.setAttribute(FONT_WEIGHT_ATTR, 'medium');
    expect(readFontWeightFromDom()).toBe('medium');
  });

  it('round-trip: apply then read matches', () => {
    applyFontWeightToDom('bold');
    expect(readFontWeightFromDom()).toBe('bold');
  });

  it('applying then re-applying same level is idempotent', () => {
    applyFontWeightToDom('bold');
    applyFontWeightToDom('bold');
    expect(document.documentElement.getAttribute(FONT_WEIGHT_ATTR)).toBe('bold');
  });
});

// ─── Exports ──────────────────────────────────────────────

describe('module exports', () => {
  it('FONT_WEIGHT_ATTR is a valid data-* attribute name', () => {
    expect(FONT_WEIGHT_ATTR).toMatch(/^data-eink-/);
  });
});
