import { describe, expect, it } from 'vitest';
import { DRILL_SETS } from '../games/drills';
import LetterKeyGame from '../games/LetterKeyGame';
import { ADVANCED_GAME_IDS } from './types';
import { gameRegistry } from './registry';

describe('game registry', () => {
  it('keeps the learning order stable', () => {
    expect(gameRegistry.map((game) => game.id)).toEqual([
      'letters',
      'numbers',
      'words',
      'find-key',
      'sequence',
      'click-target',
      'pick-picture',
      'mouse-trail',
      'drag-sort',
      'drag-match',
      'space-enter',
      'count-keys',
      'drill-home-row',
      'drill-top-row',
      'drill-bottom-row',
      'drill-long-words',
      'drill-two-words',
      'drill-numbers',
      'drill-sentences',
      'drill-sentence-enter',
    ]);
  });

  it('registers every drill as a keyboard game built from its set', () => {
    for (const id of ADVANCED_GAME_IDS) {
      const game = gameRegistry.find((entry) => entry.id === id)!;
      expect(game.category).toBe('keyboard');
      expect(game.title).toBe(DRILL_SETS[id].title);
      expect(game.rounds).toBe(6);
    }
  });

  it('uses the real letter game for the first entry', () => {
    expect(gameRegistry[0].component).toBe(LetterKeyGame);
  });
});
