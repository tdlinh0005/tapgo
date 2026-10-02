import { describe, expect, it } from 'vitest';
import { artUrl, emojiArtUrl } from '../game/art';
import { FUN_IDS } from '../game/types';
import { ARROW_MAZES, FEED_GROUPS, FEED_PAIRS, FUN_SETS, MEMORY_ITEMS, PAINT_COLORS, PAINT_PICTURES, PIANO_NOTES, PIANO_TUNES, PUZZLE_PICTURES, SEA_FRIENDS, SEARCH_TWO_WORDS, SHADOW_ITEMS, TRAIN_WORDS_2, TRAIN_WORDS_3, TRAIN_WORDS_4, type ArrowsSet, type MoleSet, type ScrollSet } from './funGames';
import { shortestPath } from './ArrowsGame';
import { WINDOW_TREATS } from './CloseWindowGame';

describe('fun park sets', () => {
  it('has six rounds per game and enough pictures for the biggest round', () => {
    for (const id of FUN_IDS) expect(FUN_SETS[id].rounds).toBe(6);
    expect(MEMORY_ITEMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(MEMORY_ITEMS.map((item) => item.emoji)).size).toBe(MEMORY_ITEMS.length);
    expect(FEED_PAIRS.every((pair) => pair.length === 2 && pair[0] !== pair[1])).toBe(true);
  });

  it('keeps tunes on the piano keys, train words at their length and paint colours in the palette', () => {
    const keys = PIANO_NOTES.map((note) => note.key).join('');
    for (const tune of PIANO_TUNES) expect(tune.notes).toMatch(new RegExp(`^[${keys}]{5,8}$`));
    for (const [length, pool] of [[2, TRAIN_WORDS_2], [3, TRAIN_WORDS_3], [4, TRAIN_WORDS_4]] as const) {
      for (const { word } of pool) expect(word).toMatch(new RegExp(`^[A-Z]{${length}}$`));
    }
    expect(SHADOW_ITEMS.length).toBeGreaterThanOrEqual(8);
    for (const picture of PAINT_PICTURES) {
      expect(picture.regions.length).toBeGreaterThanOrEqual(3);
      for (const region of picture.regions) expect(PAINT_COLORS.map((color) => color.id)).toContain(region.color);
    }
  });

  it('draws every scene, puzzle, card back and in-play picture', () => {
    for (const scene of ['sky', 'pond', 'farm', 'memory', 'stage', 'rail', 'garden', 'shadow', 'paint', 'park']) expect(artUrl(`scene-${scene}`), scene).toBeDefined();
    for (const sprite of ['mole', 'mole-hole', 'wagon']) expect(artUrl(`play/${sprite}`), sprite).toBeDefined();
    for (const { art } of PUZZLE_PICTURES) expect(artUrl(art), art).toBeDefined();
    expect(artUrl('play/card-back')).toBeDefined();
    const emojis = [
      ...MEMORY_ITEMS.map((item) => item.emoji),
      ...FEED_GROUPS.flatMap((group) => [group.place, ...group.items.map((item) => item.emoji)]),
      ...[...TRAIN_WORDS_2, ...TRAIN_WORDS_3, ...TRAIN_WORDS_4].map((item) => item.emoji),
      ...SHADOW_ITEMS.map((item) => item.emoji),
      (FUN_SETS['fun-mole'] as MoleSet).friend.emoji,
      ...SEA_FRIENDS.map((item) => item.emoji),
      ...SEARCH_TWO_WORDS.map((item) => item.emoji),
      ...WINDOW_TREATS,
      '🌳', '🔍',
      '🎈', '🐟', '🐠', '🐡', '✨', '🪣', '🚂', '🎵', '⭐',
    ];
    for (const emoji of emojis) expect(emojiArtUrl(emoji), emoji).toBeDefined();
  });

  it('keeps every arrow maze walkable and the sea deep enough for its decoys', () => {
    const { columns, rows } = FUN_SETS['fun-arrows'] as ArrowsSet;
    for (const { start, goal, trees } of ARROW_MAZES) {
      for (const cell of [start, goal, ...trees]) expect(cell[0] < columns && cell[1] < rows).toBe(true);
      expect(shortestPath(start, goal, columns, rows, trees)).not.toBeNull();
    }
    const sea = FUN_SETS['fun-scroll'] as ScrollSet;
    sea.depths.forEach((depth, round) => {
      expect(depth).toBeGreaterThanOrEqual(1);
      if (sea.decoys[round] > 1) expect(depth).toBeGreaterThanOrEqual(2);
      expect(sea.decoys[round]).toBeLessThan(SEA_FRIENDS.length);
    });
    for (const { word } of SEARCH_TWO_WORDS) expect(word).toMatch(/^[A-Z]+ [A-Z]+$/);
  });
});
