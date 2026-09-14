import type { ComponentType } from 'react';

export type GameId =
  | 'letters'
  | 'numbers'
  | 'words'
  | 'find-key'
  | 'sequence'
  | 'click-target'
  | 'pick-picture'
  | 'mouse-trail'
  | 'drag-sort'
  | 'drag-match';

export type RoundOutcome = {
  correct: number;
  attempts: number;
};

export type MiniGameProps = {
  roundIndex: number;
  totalRounds: number;
  onRoundComplete: (outcome: RoundOutcome) => void;
  speak: (text: string) => void;
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
