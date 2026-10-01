import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LetterKeyGame from './LetterKeyGame';
import SpaceEnterGame, { SPACE_ENTER_ROUNDS, spaceEnterKey } from './SpaceEnterGame';

const renderGame = (roundIndex: number, onRoundComplete = vi.fn(), onRetry = vi.fn()) =>
  render(<SpaceEnterGame roundIndex={roundIndex} totalRounds={10} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

describe('SpaceEnterGame', () => {
  it('practises both keys at least 3 times in every seeded session', () => {
    expect(SPACE_ENTER_ROUNDS).toHaveLength(10);
    for (const seed of [1, 42, 12345, 987654321]) {
      const keys = Array.from({ length: 10 }, (_, roundIndex) => spaceEnterKey(roundIndex, seed));
      expect(keys.filter((key) => key === ' ').length).toBeGreaterThanOrEqual(3);
      expect(keys.filter((key) => key === '\n').length).toBeGreaterThanOrEqual(3);
    }
  });

  it('shows a wide Space bar and completes on Space', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    renderGame(0, onRoundComplete);

    expect(screen.getByText('Bấm phím cách')).toHaveClass('game-prompt');
    expect(screen.getByRole('img', { name: 'Phím Space' })).toHaveAttribute('data-shape', 'wide');
    await user.keyboard(' ');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });

  it('accepts Enter when Enter is expected and counts Space as a mistake', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    renderGame(1, onRoundComplete, onRetry);

    expect(screen.getByText('Bấm phím Enter')).toHaveClass('game-prompt');
    expect(screen.getByRole('img', { name: 'Phím Enter' })).not.toHaveAttribute('data-shape');
    await user.keyboard(' ');
    expect(onRetry).toHaveBeenCalledWith('Thử lại nhé! Tìm phím Enter trên bàn phím nhé.');
    await user.keyboard('{Enter}');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });

  it('does not let Enter or Space press a focused button during the game', () => {
    renderGame(1);
    const button = screen.getByRole('button', { name: 'Nghe yêu cầu' });
    button.focus();

    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(false);
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(false);
  });

  it('leaves Enter alone in games that do not expect it', () => {
    const onRetry = vi.fn();
    render(<LetterKeyGame roundIndex={0} totalRounds={10} onRoundComplete={vi.fn()} onRetry={onRetry} speak={() => {}} />);

    expect(fireEvent.keyDown(window, { key: 'Enter' })).toBe(true);
    expect(onRetry).not.toHaveBeenCalled();
  });
});
