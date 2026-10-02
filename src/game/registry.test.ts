import { describe, expect, it } from 'vitest';
import { DRILL_SETS } from '../games/drills';
import LetterKeyGame from '../games/LetterKeyGame';
import { MOUSE_DRILL_SETS } from '../games/mouseDrills';
import { MISSION_SETS } from '../games/missions';
import { FUN_SETS } from '../games/funGames';
import { FUN_IDS, MISSION_IDS, MOUSE_DRILL_IDS, TYPING_DRILL_IDS } from './types';
import { gameRegistry, KEYBOARD_FUN_KINDS } from './registry';

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
      'mouse-click-many',
      'mouse-click-order',
      'mouse-click-small',
      'mouse-double-click',
      'mouse-trail-long',
      'mouse-drag-many',
      'mouse-drag-groups',
      'mouse-hold-trail',
      'mission-park',
      'mission-market',
      'mission-hide',
      'mission-small',
      'mission-boss',
      'fun-balloon',
      'fun-fishing',
      'fun-memory',
      'fun-feed',
      'fun-puzzle',
      'fun-piano',
      'fun-train',
      'fun-mole',
      'fun-shadow',
      'fun-paint',
    ]);
  });

  it('registers every drill as a keyboard game built from its set', () => {
    for (const id of TYPING_DRILL_IDS) {
      const game = gameRegistry.find((entry) => entry.id === id)!;
      expect(game.category).toBe('keyboard');
      expect(game.title).toBe(DRILL_SETS[id].title);
      expect(game.rounds).toBe(6);
    }
  });

  it('registers every mouse drill as a mouse game built from its set', () => {
    for (const id of MOUSE_DRILL_IDS) {
      const game = gameRegistry.find((entry) => entry.id === id)!;
      expect(game.category).toBe('mouse');
      expect(game.title).toBe(MOUSE_DRILL_SETS[id].title);
      expect(game.intro).toBe(MOUSE_DRILL_SETS[id].intro);
      expect(game.rounds).toBe(6);
    }
  });

  it('registers every police mission as a mouse game built from its set', () => {
    for (const id of MISSION_IDS) {
      const game = gameRegistry.find((entry) => entry.id === id)!;
      expect(game.category).toBe('mouse');
      expect(game.title).toBe(MISSION_SETS[id].title);
      expect(game.rounds).toBe(6);
    }
  });

  it('registers fun park games as keyboard for keys, piano and train and mouse for the rest', () => {
    for (const id of FUN_IDS) {
      const game = gameRegistry.find((entry) => entry.id === id)!;
      expect(game.category).toBe(KEYBOARD_FUN_KINDS.includes(FUN_SETS[id].kind) ? 'keyboard' : 'mouse');
      expect(game.title).toBe(FUN_SETS[id].title);
      expect(game.rounds).toBe(6);
    }
    expect(gameRegistry.filter((game) => FUN_IDS.includes(game.id as never) && game.category === 'keyboard').map((game) => game.id)).toEqual(['fun-balloon', 'fun-fishing', 'fun-piano', 'fun-train']);
  });

  it('uses the real letter game for the first entry', () => {
    expect(gameRegistry[0].component).toBe(LetterKeyGame);
  });
});
