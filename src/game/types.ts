import type { ComponentType } from 'react';

export const BASIC_GAME_IDS = [
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
  'space-enter',
  'count-keys',
] as const;

export const ADVANCED_GAME_IDS = [
  'drill-home-row',
  'drill-top-row',
  'drill-bottom-row',
  'drill-long-words',
  'drill-two-words',
  'drill-numbers',
  'drill-sentences',
  'drill-sentence-enter',
] as const;

export const GAME_IDS = [...BASIC_GAME_IDS, ...ADVANCED_GAME_IDS] as const;

export type BasicGameId = (typeof BASIC_GAME_IDS)[number];
export type AdvancedGameId = (typeof ADVANCED_GAME_IDS)[number];
export type GameId = (typeof GAME_IDS)[number];

export type RoundOutcome = {
  correct: number;
  attempts: number;
};

export type GameLevel = 0 | 1 | 2;

export type MiniGameProps = {
  roundIndex: number;
  totalRounds: number;
  onRoundComplete: (outcome: RoundOutcome) => void;
  onRetry?: (hint?: string) => void;
  speak: (text: string) => void;
  assistLevel?: 0 | 1 | 2;
  sessionSeed?: number;
  level?: GameLevel;
};

export type GameDefinition = {
  id: GameId;
  title: string;
  category: 'keyboard' | 'mouse';
  order: number;
  rounds: number;
  intro: string;
  emoji: string;
  component: ComponentType<MiniGameProps>;
};
