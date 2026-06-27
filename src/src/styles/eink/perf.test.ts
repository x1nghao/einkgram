// Einkgram — Phase 5: _perf.scss structural tests
//
// These tests verify the SCSS file exists, is imported, and
// contains the expected rule blocks. They don't actually
// evaluate the CSS (jsdom doesn't run SCSS) but they catch
// regressions if someone removes a rule or breaks the import.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Phase 5 _perf.scss', () => {
  // Read files relative to the repo root. The test runner
  // (vitest) sets cwd to the project root by default.
  const PERF_PATH = resolve(process.cwd(), 'src/styles/eink/_perf.scss');
  const INDEX_PATH = resolve(process.cwd(), 'src/styles/index.scss');

  function read(p: string): string {
    return readFileSync(p, 'utf8');
  }

  it('file exists in the eink styles directory', () => {
    expect(() => read(PERF_PATH)).not.toThrow();
  });

  it('is imported in src/styles/index.scss', () => {
    const source = read(INDEX_PATH);
    expect(source).toContain('eink/perf');
  });

  it('contains the 5 expected rule blocks', () => {
    const source = read(PERF_PATH);
    // 1. Repaint containment
    expect(source).toMatch(/contain:\s*layout\s+style\s+paint/);
    // 2. content-visibility auto
    expect(source).toMatch(/content-visibility:\s*auto/);
    expect(source).toMatch(/contain-intrinsic-size/);
    // 3. Disable hover
    expect(source).toMatch(/html\.eink-mode \*:hover/);
    // 4. Catch-all animations
    expect(source).toMatch(/scroll-behavior:\s*auto/);
    expect(source).toMatch(/view-transition-name:\s*none/);
    expect(source).toMatch(/::view-transition-group/);
    // 5. Image rendering
    expect(source).toMatch(/image-rendering:\s*pixelated/);
    expect(source).toMatch(/animation-delay:\s*100ms/);
  });

  it('uses html.eink-mode prefix (gated on E-Ink mode toggle)', () => {
    const source = read(PERF_PATH);
    const matches = source.match(/html\.eink-mode/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });

  it('does not use @layer (we want cascade priority, not layer priority)', () => {
    const source = read(PERF_PATH);
    expect(source).not.toMatch(/@layer\s/);
  });
});
