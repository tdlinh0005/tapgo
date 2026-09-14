import type { ProgressState } from './progress';
import type { GameId } from './types';

export const PATH_ORDER: GameId[] = [
  'letters',
  'numbers',
  'words',
  'find-key',
  'sequence',
  'click-target',
  'pick-picture',
  'mouse-trail',
  'drag-sort',
  'drag-match',
];

export function isPathUnlocked(gameId: GameId, progress: ProgressState): boolean {
  const index = PATH_ORDER.indexOf(gameId);
  if (index <= 0) return index === 0;
  return progress.games[PATH_ORDER[index - 1]].completed;
}
