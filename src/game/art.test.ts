import { describe, expect, it } from 'vitest';
import { CLICK_TARGETS } from '../games/ClickTargetGame';
import { TRAIL_THEMES } from '../games/MouseTrailGame';
import { PICTURE_ROUNDS } from '../games/PickPictureGame';
import { artUrl, emojiArtName, emojiArtUrl } from './art';
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

describe('emojiArtUrl', () => {
  it('names an in-play picture by code points without the variation selector', () => {
    expect(emojiArtName('⭐')).toBe('e-2b50');
    expect(emojiArtName('☁️')).toBe('e-2601');
    expect(emojiArtName('👨‍👩‍👧')).toBe('e-1f468-200d-1f469-200d-1f467');
  });

  it('has a picture for every emoji in click, trail and pick-picture rounds', () => {
    const emojis = [...CLICK_TARGETS.map(({ emoji }) => emoji), ...TRAIL_THEMES.flatMap(({ start, finish }) => [start, finish]), ...PICTURE_ROUNDS.flatMap(({ options }) => options)];
    expect(emojis.filter((emoji) => !emojiArtUrl(emoji))).toEqual([]);
  });
});
