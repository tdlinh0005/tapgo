import { describe, expect, it } from 'vitest';
import { MOUSE_DRILL_IDS, type MouseDrillId } from '../game/types';
import { GROUP_PAIRS, MOUSE_DRILL_SETS, SORT_GROUPS, type MouseDrillSet } from './mouseDrills';
import { TRAILS } from './MouseTrailGame';
import { MAX_CLICK_TARGETS } from './mouseLayout';

const TITLES: Record<MouseDrillId, string> = {
  'mouse-click-many': 'Chuột nâng cao 1 · Click hết các hình',
  'mouse-click-order': 'Chuột nâng cao 2 · Click theo số',
  'mouse-click-small': 'Chuột nâng cao 3 · Click hình nhỏ',
  'mouse-double-click': 'Chuột nâng cao 4 · Nháy đúp chuột',
  'mouse-trail-long': 'Chuột nâng cao 5 · Rê chuột đường dài',
  'mouse-drag-many': 'Chuột nâng cao 6 · Kéo nhiều món',
  'mouse-drag-groups': 'Chuột nâng cao 7 · Phân loại hai nhóm',
  'mouse-hold-trail': 'Chuột nâng cao 8 · Giữ chuột kéo theo đường',
};

const VIETNAMESE_DIACRITIC = /[à-ỹđ]/;
const sets = MOUSE_DRILL_IDS.map((id) => [id, MOUSE_DRILL_SETS[id]] as const);
const set = <K extends MouseDrillSet['kind']>(id: MouseDrillId, kind: K) => {
  const found = MOUSE_DRILL_SETS[id];
  if (found.kind !== kind) throw new Error(`${id} is not ${kind}`);
  return found as Extract<MouseDrillSet, { kind: K }>;
};
const lengths = (id: MouseDrillId) => set(id, 'trail').items.map((trail) => trail.length);

describe('mouse drill sets', () => {
  it.each(sets)('%s has its title, a Vietnamese intro, 6 rounds and at least 8 unique items', (id, drill) => {
    expect(drill.title).toBe(TITLES[id]);
    expect(drill.intro).toMatch(VIETNAMESE_DIACRITIC);
    expect(drill.emoji).not.toBe('');
    expect(drill.rounds).toBe(6);
    expect(drill.items.length).toBeGreaterThanOrEqual(8);
    expect(new Set(drill.items.map((item) => JSON.stringify(item))).size).toBe(drill.items.length);
  });

  it('keeps every trail point inside the play area', () => {
    for (const id of ['mouse-trail-long', 'mouse-hold-trail'] as const) {
      for (const trail of set(id, 'trail').items) {
        for (const [x, y] of trail) {
          expect(x).toBeGreaterThanOrEqual(8);
          expect(x).toBeLessThanOrEqual(92);
          expect(y).toBeGreaterThanOrEqual(20);
          expect(y).toBeLessThanOrEqual(80);
        }
      }
    }
  });

  it('splits drag pictures evenly and never shares a picture between groups', () => {
    const emojis = SORT_GROUPS.flatMap(({ items }) => items.map(({ emoji }) => emoji));
    expect(new Set(emojis).size).toBe(emojis.length);
    for (const id of ['mouse-drag-many', 'mouse-drag-groups'] as const) {
      const drill = set(id, 'multi-drag');
      for (const groups of drill.items) {
        expect(new Set(groups.map(({ id: groupId }) => groupId)).size).toBe(groups.length);
        for (const group of groups) expect(group.items.length).toBeGreaterThanOrEqual(drill.itemCount / groups.length);
      }
    }
    expect(GROUP_PAIRS.every((pair) => pair.length === 2)).toBe(true);
  });

  it('gets harder from set 1 to set 8', () => {
    expect(MOUSE_DRILL_IDS.map((id) => MOUSE_DRILL_SETS[id].kind)).toEqual(['multi-click', 'multi-click', 'multi-click', 'double-click', 'trail', 'multi-drag', 'multi-drag', 'trail']);

    const clicks = (['mouse-click-many', 'mouse-click-order', 'mouse-click-small'] as const).map((id) => set(id, 'multi-click'));
    expect(clicks.map(({ targetCounts }) => targetCounts)).toEqual([[3], [4, 5], [5]]);
    expect(clicks.map(({ size }) => size)).toEqual(['medium', 'medium', 'small']);
    expect(clicks.map(({ ordered }) => ordered)).toEqual([false, true, false]);
    for (let index = 1; index < clicks.length; index += 1) {
      expect(Math.min(...clicks[index].targetCounts)).toBeGreaterThan(Math.min(...clicks[index - 1].targetCounts));
    }
    expect(Math.max(...clicks.flatMap(({ targetCounts }) => targetCounts))).toBeLessThanOrEqual(MAX_CLICK_TARGETS);

    const longTrail = set('mouse-trail-long', 'trail');
    expect(Math.min(...lengths('mouse-trail-long'))).toBeGreaterThanOrEqual(9);
    expect(Math.max(...lengths('mouse-trail-long'))).toBeLessThanOrEqual(12);
    expect(Math.min(...lengths('mouse-trail-long'))).toBeGreaterThan(Math.max(...TRAILS.map((trail) => trail.length)));
    expect(longTrail).toMatchObject({ checkpointSize: 'small', hold: false });

    const drags = (['mouse-drag-many', 'mouse-drag-groups'] as const).map((id) => set(id, 'multi-drag'));
    expect(drags.map(({ itemCount }) => itemCount)).toEqual([3, 4]);
    expect(drags.map(({ items }) => new Set(items.map((groups) => groups.length)))).toEqual([new Set([1]), new Set([2])]);

    const holdTrail = set('mouse-hold-trail', 'trail');
    expect(holdTrail.hold).toBe(true);
    expect(Math.min(...lengths('mouse-hold-trail'))).toBeGreaterThanOrEqual(6);
    expect(Math.max(...lengths('mouse-hold-trail'))).toBeLessThanOrEqual(8);
  });
});
