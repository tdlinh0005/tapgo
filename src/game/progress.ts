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

function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ProgressState>;
  if (candidate.version !== 1 || !candidate.games || typeof candidate.games !== 'object') {
    return false;
  }
  if (
    candidate.lastGameId !== null &&
    (typeof candidate.lastGameId !== 'string' || !GAME_IDS.includes(candidate.lastGameId as GameId))
  ) {
    return false;
  }

  return GAME_IDS.every((gameId) => {
    const game = candidate.games?.[gameId];
    return Boolean(
      game &&
      typeof game === 'object' &&
      Number.isInteger(game.plays) &&
      game.plays >= 0 &&
      Number.isInteger(game.bestStars) &&
      game.bestStars >= 0 &&
      game.bestStars <= 3 &&
      typeof game.completed === 'boolean' &&
      (game.lastPlayedAt === null || typeof game.lastPlayedAt === 'string'),
    );
  });
}

export function loadProgressFrom(raw: string | null): ProgressState {
  if (!raw) return createDefaultProgress();

  try {
    const parsed: unknown = JSON.parse(raw);
    return isProgressState(parsed) ? parsed : createDefaultProgress();
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
