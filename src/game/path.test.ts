import { describe, expect, it } from 'vitest';
import { createDefaultProgress, recordCompletion } from './progress';
import { getNextGameId, getRecommendedGameId, isPathUnlocked, PATH_ORDER } from './path';

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

  it('falls back to the first game under 3 stars, then to letters', () => {
    let progress = createDefaultProgress();
    for (const gameId of PATH_ORDER) progress = recordCompletion(progress, gameId, 3);
    expect(getRecommendedGameId(progress)).toBe('letters');

    progress = recordCompletion(createDefaultProgress(), 'letters', 3);
    for (const gameId of PATH_ORDER.slice(1)) progress = recordCompletion(progress, gameId, gameId === 'mouse-trail' ? 2 : 3);
    expect(getRecommendedGameId(progress)).toBe('mouse-trail');
  });

  it('never recommends the excluded game', () => {
    let progress = createDefaultProgress();
    for (const gameId of PATH_ORDER) progress = recordCompletion(progress, gameId, 3);
    progress = { ...progress, games: { ...progress.games, words: { ...progress.games.words, bestStars: 2 } } };

    expect(getRecommendedGameId(progress)).toBe('words');
    expect(getRecommendedGameId(progress, 'words')).toBe('letters');
    expect(getRecommendedGameId(createDefaultProgress(), 'letters')).toBe('numbers');
  });

  it('uses the same canonical order for next-game navigation', () => {
    expect(getNextGameId('letters')).toBe('numbers');
    expect(getNextGameId('drag-match')).toBeNull();
  });
});
