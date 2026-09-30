import { GAME_IDS, type GameId } from './types';

export type GameProgress = {
  plays: number;
  bestStars: 0 | 1 | 2 | 3;
  completed: boolean;
  lastPlayedAt: string | null;
};

export type ProgressState = {
  version: 1;
  lastGameId: GameId | null;
  games: Record<GameId, GameProgress>;
};

export const PROGRESS_KEY = 'tapgo.progress.v1';

function createEmptyGameProgress(): GameProgress {
  return {
    plays: 0,
    bestStars: 0,
    completed: false,
    lastPlayedAt: null,
  };
}

export function createDefaultProgress(): ProgressState {
  return {
    version: 1,
    lastGameId: null,
    games: Object.fromEntries(
      GAME_IDS.map((gameId) => [gameId, createEmptyGameProgress()]),
    ) as Record<GameId, GameProgress>,
  };
}

function isGameProgress(value: unknown): value is GameProgress {
  if (!value || typeof value !== 'object') return false;
  const { plays, bestStars, completed, lastPlayedAt } = value as Record<string, unknown>;
  return (
    typeof plays === 'number' &&
    Number.isInteger(plays) &&
    plays >= 0 &&
    typeof bestStars === 'number' &&
    Number.isInteger(bestStars) &&
    bestStars >= 0 &&
    bestStars <= 3 &&
    typeof completed === 'boolean' &&
    (lastPlayedAt === null || typeof lastPlayedAt === 'string')
  );
}

function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && GAME_IDS.includes(value as GameId);
}

function normalizeProgress(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return createDefaultProgress();
  const candidate = raw as { version?: unknown; lastGameId?: unknown; games?: unknown };
  if (candidate.version !== 1) return createDefaultProgress();

  const savedGames = (candidate.games && typeof candidate.games === 'object' ? candidate.games : {}) as Record<string, unknown>;
  const games = Object.fromEntries(
    GAME_IDS.map((gameId) => {
      const saved = savedGames[gameId];
      return [gameId, isGameProgress(saved) ? saved : createEmptyGameProgress()];
    }),
  ) as Record<GameId, GameProgress>;

  return {
    version: 1,
    lastGameId: isGameId(candidate.lastGameId) ? candidate.lastGameId : null,
    games,
  };
}

export function loadProgressFrom(raw: string | null): ProgressState {
  if (!raw) return createDefaultProgress();

  try {
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return createDefaultProgress();
  }
}

export function loadProgress(): ProgressState {
  try {
    return loadProgressFrom(window.localStorage.getItem(PROGRESS_KEY));
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // Persistence is optional for gameplay; storage failures must not block the child.
  }
}

export function recordCompletion(
  state: ProgressState,
  gameId: GameId,
  stars: 1 | 2 | 3,
): ProgressState {
  const current = state.games[gameId];

  return {
    ...state,
    lastGameId: gameId,
    games: {
      ...state.games,
      [gameId]: {
        ...current,
        plays: current.plays + 1,
        bestStars: Math.max(current.bestStars, stars) as 1 | 2 | 3,
        completed: true,
        lastPlayedAt: new Date().toISOString(),
      },
    },
  };
}
