import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionSeed, pickRound, shuffleWithSeed } from './pickRound';

const POOL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'M', 'N', 'P'];
const session = (seed: number | undefined, rounds: number) => Array.from({ length: rounds }, (_, index) => pickRound(POOL, index, seed));

describe('pickRound', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is deterministic for the same seed and round', () => {
    expect(session(42, 10)).toEqual(session(42, 10));
    expect(pickRound(POOL, 3, 7)).toBe(pickRound(POOL, 3, 7));
  });

  it('changes the order for a different seed', () => {
    expect(session(1, POOL.length)).not.toEqual(session(2, POOL.length));
  });

  it('never repeats an item within a session when the pool covers the rounds', () => {
    [0, 1, 99, 123456789, 0xffffffff].forEach((seed) => {
      const picked = session(seed, 10);
      expect(new Set(picked).size).toBe(10);
      picked.forEach((item) => expect(POOL).toContain(item));
    });
  });

  it('keeps the old in-order behavior without a seed', () => {
    expect(session(undefined, 14)).toEqual([...POOL, 'A', 'B']);
  });

  it('wraps around the seeded permutation when rounds exceed the pool', () => {
    const pool = ['X', 'Y', 'Z'];
    expect(pickRound(pool, 4, 5)).toBe(pickRound(pool, 1, 5));
  });

  it('shuffles into a permutation of the same items without mutating the input', () => {
    const input = [...POOL];
    const shuffled = shuffleWithSeed(input, 9);
    expect(input).toEqual(POOL);
    expect([...shuffled].sort()).toEqual([...POOL].sort());
  });

  it('creates a 32-bit unsigned session seed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999999);
    const seed = createSessionSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(0x100000000);
  });
});
