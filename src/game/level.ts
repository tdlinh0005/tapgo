import type { GameLevel } from './types';

export function levelFromStars(bestStars: 0 | 1 | 2 | 3): GameLevel {
  if (bestStars >= 3) return 2;
  if (bestStars === 2) return 1;
  return 0;
}
