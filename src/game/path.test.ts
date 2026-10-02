import { describe, expect, it } from 'vitest';
import { createDefaultProgress, recordCompletion } from './progress';
import { getNextGameId, getRecommendedGameId, isPathUnlocked, PATH_ORDER } from './path';
import { BASIC_GAME_IDS, TYPING_DRILL_IDS } from './types';

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

  it('moves on to the first drill once every basic game is completed', () => {
    let progress = createDefaultProgress();
    for (const gameId of BASIC_GAME_IDS) progress = recordCompletion(progress, gameId, 2);
    expect(getRecommendedGameId(progress)).toBe('drill-home-row');
  });

  it('recommends the first mouse drill once every typing drill is completed', () => {
    let progress = createDefaultProgress();
    for (const gameId of [...BASIC_GAME_IDS, ...TYPING_DRILL_IDS]) progress = recordCompletion(progress, gameId, 2);
    expect(getRecommendedGameId(progress)).toBe('mouse-click-many');
  });

  it('prefers a drill under 3 stars over a basic game under 3 stars', () => {
    let progress = createDefaultProgress();
    for (const gameId of PATH_ORDER) progress = recordCompletion(progress, gameId, gameId === 'words' || gameId === 'drill-numbers' ? 2 : 3);
    expect(getRecommendedGameId(progress)).toBe('drill-numbers');
  });

  it('falls back to the first game under 3 stars, then to the first drill', () => {
    let progress = createDefaultProgress();
    for (const gameId of PATH_ORDER) progress = recordCompletion(progress, gameId, 3);
    expect(getRecommendedGameId(progress)).toBe('drill-home-row');
    expect(getRecommendedGameId(progress, 'drill-home-row')).toBe('drill-top-row');

    progress = recordCompletion(createDefaultProgress(), 'letters', 3);
    for (const gameId of PATH_ORDER.slice(1)) progress = recordCompletion(progress, gameId, gameId === 'mouse-trail' ? 2 : 3);
    expect(getRecommendedGameId(progress)).toBe('mouse-trail');
  });

  it('never recommends the excluded game', () => {
    let progress = createDefaultProgress();
    for (const gameId of PATH_ORDER) progress = recordCompletion(progress, gameId, 3);
    progress = { ...progress, games: { ...progress.games, words: { ...progress.games.words, bestStars: 2 } } };

    expect(getRecommendedGameId(progress)).toBe('words');
    expect(getRecommendedGameId(progress, 'words')).toBe('drill-home-row');
    expect(getRecommendedGameId(createDefaultProgress(), 'letters')).toBe('numbers');
  });

  it('uses the same canonical order for next-game navigation', () => {
    expect(getNextGameId('letters')).toBe('numbers');
    expect(getNextGameId('drag-match')).toBe('space-enter');
    expect(getNextGameId('space-enter')).toBe('count-keys');
    expect(getNextGameId('count-keys')).toBe('drill-home-row');
    expect(getNextGameId('drill-sentence-enter')).toBe('mouse-click-many');
    expect(getNextGameId('mouse-drag-groups')).toBe('mouse-hold-trail');
    expect(getNextGameId('mouse-hold-trail')).toBe('mission-park');
    expect(getNextGameId('mission-boss')).toBeNull();
    expect(PATH_ORDER.at(-1)).toBe('mission-boss');
  });
});
