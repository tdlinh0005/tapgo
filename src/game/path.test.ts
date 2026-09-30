import { describe, expect, it } from 'vitest';
import { createDefaultProgress, recordCompletion } from './progress';
import { getNextGameId, getRecommendedGameId, isPathUnlocked } from './path';

describe('path unlock', () => {
  it('unlocks the first game only by default', () => {
    const progress = createDefaultProgress();
    expect(isPathUnlocked('letters', progress)).toBe(true);
    expect(isPathUnlocked('numbers', progress)).toBe(false);
  });

  it('unlocks the next game when the previous one is completed', () => {
    const completed = recordCompletion(createDefaultProgress(), 'letters', 2);
    expect(isPathUnlocked('numbers', completed)).toBe(true);
  });

  it('recommends the first unfinished game', () => {
    const completed = recordCompletion(createDefaultProgress(), 'letters', 2);
    expect(getRecommendedGameId(completed)).toBe('numbers');
  });

  it('uses the same canonical order for next-game navigation', () => {
    expect(getNextGameId('letters')).toBe('numbers');
    expect(getNextGameId('drag-match')).toBeNull();
  });
});
