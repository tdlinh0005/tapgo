export function createSessionSeed(): number {
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const random = mulberry32(seed);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export const roundSeed = (roundIndex: number, sessionSeed?: number) => (sessionSeed ?? 0) + roundIndex;

export function pickRound<T>(pool: readonly T[], roundIndex: number, seed?: number): T {
  const index = roundIndex % pool.length;
  if (seed === undefined) return pool[index];
  return shuffleWithSeed(pool, seed)[index];
}
