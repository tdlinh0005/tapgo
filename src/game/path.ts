import type { ProgressState } from './progress';
import { ADVANCED_GAME_IDS, GAME_IDS, type GameId } from './types';

export const PATH_ORDER: readonly GameId[] = GAME_IDS;

export function isPathUnlocked(gameId: GameId, progress: ProgressState): boolean {
  const index = PATH_ORDER.indexOf(gameId);
  if (index <= 0) return index === 0;
  return progress.games[PATH_ORDER[index - 1]].completed;
}

export function getRecommendedGameId(progress: ProgressState, excludeGameId?: GameId): GameId {
  const candidates = PATH_ORDER.filter((gameId) => gameId !== excludeGameId);
  const advanced = candidates.filter((gameId) => (ADVANCED_GAME_IDS as readonly GameId[]).includes(gameId));
  const underThreeStars = (gameId: GameId) => progress.games[gameId].bestStars < 3;
  return (
    candidates.find((gameId) => !progress.games[gameId].completed)
    ?? advanced.find(underThreeStars)
    ?? candidates.find(underThreeStars)
    ?? advanced[0]
  );
}

export function getNextGameId(gameId: GameId): GameId | null {
  const index = PATH_ORDER.indexOf(gameId);
  return index >= 0 ? PATH_ORDER[index + 1] ?? null : null;
}
