import { describe, expect, it } from 'vitest';
import {
  createDefaultProgress,
  loadProgressFrom,
  recordCompletion,
} from './progress';

describe('progress', () => {
  it('uses defaults for missing or corrupt storage', () => {
    expect(loadProgressFrom(null)).toEqual(createDefaultProgress());
    expect(loadProgressFrom('{bad json')).toEqual(createDefaultProgress());
  });

  it('keeps the best star result', () => {
    const completed = recordCompletion(createDefaultProgress(), 'letters', 2);
    expect(completed.games.letters.bestStars).toBe(2);
    expect(recordCompletion(completed, 'letters', 1).games.letters.bestStars).toBe(2);
  });

  it('increments plays and records completion', () => {
    const completed = recordCompletion(createDefaultProgress(), 'letters', 3);
    expect(completed.games.letters.plays).toBe(1);
    expect(completed.games.letters.completed).toBe(true);
    expect(completed.lastGameId).toBe('letters');
  });
});
