import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createDefaultProgress,
  loadProgress,
  loadProgressFrom,
  recordCompletion,
  saveProgress,
} from './progress';
import { GAME_IDS } from './types';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('progress', () => {
  it('uses defaults for missing or corrupt storage', () => {
    expect(loadProgressFrom(null)).toEqual(createDefaultProgress());
    expect(loadProgressFrom('{bad json')).toEqual(createDefaultProgress());
  });

  it('does not crash when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(loadProgress()).toEqual(createDefaultProgress());
    expect(() => saveProgress(createDefaultProgress())).not.toThrow();
  });

  it('rejects malformed saved state', () => {
    const invalidGameId = createDefaultProgress() as unknown as { lastGameId: string; games: Record<string, unknown> };
    invalidGameId.lastGameId = 'not-a-game';
    expect(loadProgressFrom(JSON.stringify(invalidGameId))).toEqual(createDefaultProgress());

    const fractionalStars = createDefaultProgress();
    fractionalStars.games.letters.bestStars = 2.5 as 2;
    expect(loadProgressFrom(JSON.stringify(fractionalStars))).toEqual(createDefaultProgress());
  });

  it('keeps valid games when one saved game entry is corrupt', () => {
    let saved = createDefaultProgress();
    for (const gameId of GAME_IDS.slice(1)) saved = recordCompletion(saved, gameId, 2);
    const raw = JSON.parse(JSON.stringify(saved));
    raw.games[GAME_IDS[0]] = { plays: 'x' };

    const loaded = loadProgressFrom(JSON.stringify(raw));
    expect(loaded.games[GAME_IDS[0]]).toEqual(createDefaultProgress().games[GAME_IDS[0]]);
    for (const gameId of GAME_IDS.slice(1)) expect(loaded.games[gameId]).toEqual(saved.games[gameId]);
    expect(loaded.lastGameId).toBe(saved.lastGameId);
  });

  it('fills games missing from saved state and drops an unknown last game', () => {
    const saved = recordCompletion(createDefaultProgress(), 'letters', 3);
    const raw = JSON.parse(JSON.stringify(saved));
    delete raw.games.numbers;
    raw.lastGameId = 'removed-game';

    const loaded = loadProgressFrom(JSON.stringify(raw));
    expect(loaded.games.letters).toEqual(saved.games.letters);
    expect(loaded.games.numbers).toEqual(createDefaultProgress().games.numbers);
    expect(loaded.lastGameId).toBeNull();
  });

  it('rejects state from another version', () => {
    const saved = { ...recordCompletion(createDefaultProgress(), 'letters', 3), version: 2 };
    expect(loadProgressFrom(JSON.stringify(saved))).toEqual(createDefaultProgress());
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
