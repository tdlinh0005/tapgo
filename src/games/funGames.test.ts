import { describe, expect, it } from 'vitest';
import { artUrl, emojiArtUrl } from '../game/art';
import { FUN_IDS } from '../game/types';
import { FEED_GROUPS, FEED_PAIRS, FUN_SETS, MEMORY_ITEMS, PUZZLE_PICTURES } from './funGames';

describe('fun park sets', () => {
  it('has six rounds per game and enough pictures for the biggest round', () => {
    for (const id of FUN_IDS) expect(FUN_SETS[id].rounds).toBe(6);
    expect(MEMORY_ITEMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(MEMORY_ITEMS.map((item) => item.emoji)).size).toBe(MEMORY_ITEMS.length);
    expect(FEED_PAIRS.every((pair) => pair.length === 2 && pair[0] !== pair[1])).toBe(true);
  });

  it('draws every scene, puzzle, card back and in-play picture', () => {
    for (const scene of ['sky', 'pond', 'farm', 'memory']) expect(artUrl(`scene-${scene}`), scene).toBeDefined();
    for (const { art } of PUZZLE_PICTURES) expect(artUrl(art), art).toBeDefined();
    expect(artUrl('play/card-back')).toBeDefined();
    const emojis = [
      ...MEMORY_ITEMS.map((item) => item.emoji),
      ...FEED_GROUPS.flatMap((group) => [group.place, ...group.items.map((item) => item.emoji)]),
      '🎈', '🐟', '🐠', '🐡', '✨', '🪣',
    ];
    for (const emoji of emojis) expect(emojiArtUrl(emoji), emoji).toBeDefined();
  });
});
