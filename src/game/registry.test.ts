import { describe, expect, it } from 'vitest';
import LetterKeyGame from '../games/LetterKeyGame';
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
    ]);
  });

  it('uses the real letter game for the first entry', () => {
    expect(gameRegistry[0].component).toBe(LetterKeyGame);
  });
});
