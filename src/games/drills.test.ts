import { describe, expect, it } from 'vitest';
import { TYPING_DRILL_IDS, type TypingDrillId } from '../game/types';
import { DRILL_SETS, KEYBOARD_ROWS } from './drills';

const sets = TYPING_DRILL_IDS.map((id) => [id, DRILL_SETS[id]] as const);
const lengths = (id: TypingDrillId) => DRILL_SETS[id].items.map(({ text }) => text.length);
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

describe('drill sets', () => {
  it.each(sets)('%s has at least 10 unique items with a picture and a spoken text', (_id, set) => {
    expect(set.items.length).toBeGreaterThanOrEqual(10);
    expect(new Set(set.items.map(({ text }) => text)).size).toBe(set.items.length);
    for (const { text, emoji, say } of set.items) {
      expect(text).toMatch(/^[A-Z0-9 ]+\n?$/);
      expect(text).not.toMatch(/^ | $|  /);
      expect(emoji).not.toBe('');
      expect(say).not.toBe('');
    }
  });

  it('keeps the row drills on their own keyboard row', () => {
    for (const [id, keys] of Object.entries(KEYBOARD_ROWS)) {
      for (const { text } of DRILL_SETS[id as keyof typeof KEYBOARD_ROWS].items) {
        expect(text.split('').every((key) => keys.includes(key)), `${id} ${text}`).toBe(true);
      }
    }
  });

  it('only the two-word, number and sentence drills use Space, and only the last set uses Enter', () => {
    for (const [id, set] of sets) {
      const usesSpace = set.items.every(({ text }) => text.includes(' '));
      const usesEnter = set.items.every(({ text }) => text.endsWith('\n'));
      expect(usesSpace, id).toBe(['drill-two-words', 'drill-numbers', 'drill-sentences', 'drill-sentence-enter'].includes(id));
      expect(usesEnter, id).toBe(id === 'drill-sentence-enter');
      if (!usesEnter) expect(set.items.some(({ text }) => text.includes('\n')), id).toBe(false);
    }
  });

  it('gets harder from set 1 to set 8', () => {
    for (let index = 1; index < TYPING_DRILL_IDS.length; index += 1) {
      const previous = lengths(TYPING_DRILL_IDS[index - 1]);
      const current = lengths(TYPING_DRILL_IDS[index]);
      expect(Math.max(...current), TYPING_DRILL_IDS[index]).toBeGreaterThanOrEqual(Math.max(...previous));
      expect(average(current), TYPING_DRILL_IDS[index]).toBeGreaterThan(average(previous));
    }
  });

  it('uses digits only in the number drill', () => {
    for (const [id, set] of sets) {
      expect(set.items.some(({ text }) => /\d/.test(text)), id).toBe(id === 'drill-numbers');
    }
  });
});
