import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MiniGameProps } from '../game/types';
import ClickTargetGame from '../games/ClickTargetGame';
import LetterKeyGame from '../games/LetterKeyGame';
import MouseTrailGame from '../games/MouseTrailGame';
import NumberKeyGame from '../games/NumberKeyGame';
import SequenceTypingGame from '../games/SequenceTypingGame';
import SpaceEnterGame from '../games/SpaceEnterGame';
import CountKeysGame from '../games/CountKeysGame';
import WordTypingGame from '../games/WordTypingGame';

const cases: [string, ComponentType<MiniGameProps>, string][] = [
  ['letters', LetterKeyGame, 'Bấm chữ A'],
  ['numbers', NumberKeyGame, 'Bấm số 1'],
  ['words', WordTypingGame, 'Gõ từ ME'],
  ['sequence', SequenceTypingGame, 'A S D'],
  ['click', ClickTargetGame, 'ngôi sao'],
  ['trail', MouseTrailGame, 'đích'],
  ['space-enter', SpaceEnterGame, 'Bấm phím cách'],
  ['count-keys', CountKeysGame, 'Có mấy quả táo'],
];

describe('Nghe yêu cầu', () => {
  it.each(cases)('reads the round goal aloud in the %s game', (_name, Game, expected) => {
    const speak = vi.fn();
    render(<Game roundIndex={0} totalRounds={6} onRoundComplete={vi.fn()} onRetry={vi.fn()} speak={speak} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));

    expect(speak).toHaveBeenCalledWith(expect.stringContaining(expected));
  });
});
