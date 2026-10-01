import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MiniGameProps } from '../game/types';
import ClickTargetGame from './ClickTargetGame';
import DragMatchGame from './DragMatchGame';
import DragSortGame from './DragSortGame';
import FindKeyGame from './FindKeyGame';
import LetterKeyGame from './LetterKeyGame';
import MouseTrailGame from './MouseTrailGame';
import NumberKeyGame from './NumberKeyGame';
import PickPictureGame from './PickPictureGame';
import SequenceTypingGame from './SequenceTypingGame';
import SpaceEnterGame from './SpaceEnterGame';
import WordTypingGame from './WordTypingGame';

const games: [string, ComponentType<MiniGameProps>][] = [
  ['click', ClickTargetGame],
  ['trail', MouseTrailGame],
  ['drag sort', DragSortGame],
  ['drag match', DragMatchGame],
  ['pick picture', PickPictureGame],
  ['letters', LetterKeyGame],
  ['numbers', NumberKeyGame],
  ['find key', FindKeyGame],
  ['words', WordTypingGame],
  ['sequence', SequenceTypingGame],
  ['space enter', SpaceEnterGame],
];

const renderGame = (Game: ComponentType<MiniGameProps>, assistLevel: 0 | 1 | 2) =>
  render(<Game roundIndex={0} totalRounds={6} onRoundComplete={vi.fn()} onRetry={vi.fn()} speak={vi.fn()} assistLevel={assistLevel} />);

describe('assist levels', () => {
  it.each(games)('marks exactly one real target in the %s game', (_name, Game) => {
    for (const level of [1, 2] as const) {
      const { container, unmount } = renderGame(Game, level);
      expect(container.querySelectorAll(`[data-assist="${level}"]`)).toHaveLength(1);
      unmount();
    }
    const { container } = renderGame(Game, 0);
    expect(container.querySelector('[data-assist]')).toBeNull();
  });
});
