import { describe, expect, it } from 'vitest';
import { levelFromStars } from './level';

describe('levelFromStars', () => {
  it('maps best stars to easy, medium and hard', () => {
    expect(levelFromStars(0)).toBe(0);
    expect(levelFromStars(1)).toBe(0);
    expect(levelFromStars(2)).toBe(1);
    expect(levelFromStars(3)).toBe(2);
  });
});
