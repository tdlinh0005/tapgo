import type { ProgressState } from './progress';
import { GAME_IDS, type GameId } from './types';

export const PATH_ORDER: readonly GameId[] = GAME_IDS;

export function isPathUnlocked(gameId: GameId, progress: ProgressState): boolean {
  const index = PATH_ORDER.indexOf(gameId);
  if (index <= 0) return index === 0;
  return progress.games[PATH_ORDER[index - 1]].completed;
}

export function getRecommendedGameId(progress: ProgressState, excludeGameId?: GameId): GameId {
  const candidates = PATH_ORDER.filter((gameId) => gameId !== excludeGameId);
  return (
    candidates.find((gameId) => !progress.games[gameId].completed)
    ?? candidates.find((gameId) => progress.games[gameId].bestStars < 3)
    ?? candidates[0]
  );
}

export function getNextGameId(gameId: GameId): GameId | null {
  const index = PATH_ORDER.indexOf(gameId);
  return index >= 0 ? PATH_ORDER[index + 1] ?? null : null;
}
