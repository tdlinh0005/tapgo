// @ts-expect-error Vitest runs in Node; this project intentionally does not depend on Node type declarations.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/app.css', 'utf8');

describe('app visual acceptance rules', () => {
  it('keeps primary actions and game targets large enough for a child', () => {
    expect(css).toMatch(/\.action-button\s*\{[^}]*min-height:\s*72px/s);
    expect(css).toMatch(/\.game-card button\s*\{[^}]*min-height:\s*72px/s);
    expect(css).toMatch(/\.click-target\s*\{[^}]*width:\s*104px[^}]*height:\s*104px/s);
    expect(css).toMatch(/\.click-target-visual\s*\{[^}]*width:\s*72px[^}]*height:\s*72px/s);
    expect(css).toMatch(/\.picture-option\s*\{[^}]*min-width:\s*96px[^}]*min-height:\s*96px/s);
  });

  it('keeps header, guide and listen buttons at least 72px', () => {
    expect(css).toMatch(/\.screen-header > button,\s*\.game-header > button\s*\{[^}]*width:\s*72px[^}]*height:\s*72px/s);
    expect(css).toMatch(/\.guide-toggle\s*\{[^}]*min-height:\s*72px/s);
    expect(css).toMatch(/\.listen-button\s*\{[^}]*min-height:\s*72px/s);
  });

  it('creates positioned play areas for click and trail games', () => {
    expect(css).toMatch(/\.click-play-area\s*\{[^}]*position:\s*relative/s);
    expect(css).toMatch(/\.click-target\s*\{[^}]*position:\s*absolute/s);
    expect(css).toMatch(/\.trail-area\s*\{[^}]*position:\s*relative/s);
    expect(css).toMatch(/\.trail-checkpoint\s*\{[^}]*position:\s*absolute/s);
  });

  it('uses theme tokens instead of literal foreground colors', () => {
    expect(css).not.toMatch(/color:\s*white/);
  });

  it('preserves keyboard focus and reduced-motion support', () => {
    expect(css).toContain(':focus-visible');
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('defines positive and retry feedback animations under the shared game stage', () => {
    expect(css).toMatch(/\.game-stage\.is-correct\s*\{[^}]*animation:/s);
    expect(css).toMatch(/\.game-stage\.is-retry\s*\{[^}]*animation:/s);
  });
});
