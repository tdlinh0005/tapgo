import { describe, expect, it } from 'vitest';
import css from './app.css?raw';
import theme from './theme.css?raw';

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

  it('makes the round prompt larger than the game title', () => {
    expect(css).toMatch(/\.game-heading h1\s*\{[^}]*font-size:\s*28px/s);
    expect(css).toMatch(/\.game-prompt\s*\{[^}]*font-size:\s*var\(--font-prompt\)/s);
    expect(theme).toMatch(/--font-prompt:\s*clamp\(44px/);
  });

  it('takes radius and feedback timing from theme tokens', () => {
    expect(css).not.toMatch(/border-radius:\s*\d+px/);
    expect(css).toMatch(/animation:\s*tapgo-pop var\(--motion-pop\)/);
    expect(css).toMatch(/animation:\s*tapgo-shake var\(--motion-shake\)/);
  });

  it('creates positioned play areas for click and trail games', () => {
    expect(css).toMatch(/\.click-play-area\s*\{[^}]*position:\s*relative/s);
    expect(css).toMatch(/\.click-target\s*\{[^}]*position:\s*absolute/s);
    expect(css).toMatch(/\.trail-area\s*\{[^}]*position:\s*relative/s);
    expect(css).toMatch(/\.trail-checkpoint\s*\{[^}]*position:\s*absolute/s);
  });

  it('does not force a desktop width on the body so the desktop gate never scrolls sideways', () => {
    expect(css).not.toMatch(/(^|\n)body\s*\{[^}]*min-width/s);
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
