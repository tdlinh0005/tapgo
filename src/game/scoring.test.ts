import { describe, expect, it } from 'vitest';
import { calculateStars } from './scoring';

describe('calculateStars', () => {
  it('returns 1 star for completed low-accuracy session', () => {
    expect(calculateStars([{ correct: 4, attempts: 8 }])).toBe(1);
  });

  it('returns 2 stars at 75 percent accuracy', () => {
    expect(calculateStars([{ correct: 6, attempts: 8 }])).toBe(2);
  });

  it('returns 3 stars at 90 percent accuracy', () => {
    expect(calculateStars([{ correct: 9, attempts: 10 }])).toBe(3);
  });

  it('returns 1 star when no attempts were recorded', () => {
    expect(calculateStars([{ correct: 0, attempts: 0 }])).toBe(1);
  });
});
