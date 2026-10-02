import { describe, expect, it } from 'vitest';
import { artUrl } from './art';
import { GAME_IDS } from './types';

describe('artUrl', () => {
  it('has a drawing for every game and every mascot mood', () => {
    const names = [...GAME_IDS, 'mascot-idle', 'mascot-cheer', 'mascot-encourage'];
    expect(names.filter((name) => !artUrl(name))).toEqual([]);
  });

  it('returns undefined for a name with no drawing so callers keep the emoji', () => {
    expect(artUrl('no-such-art')).toBeUndefined();
  });
});
