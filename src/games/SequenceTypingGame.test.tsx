import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SequenceTypingGame, { SEQUENCES } from './SequenceTypingGame';
import { WORDS } from './WordTypingGame';

describe('SequenceTypingGame', () => {
  it('uses sequences of 3 to 5 keys that are not words from the word game', () => {
    const words: readonly string[] = WORDS;
    for (const sequence of SEQUENCES) {
      expect(sequence.length).toBeGreaterThanOrEqual(3);
      expect(sequence.length).toBeLessThanOrEqual(5);
      expect(words).not.toContain(sequence);
    }
    expect(SEQUENCES.some((sequence) => sequence.length > 3)).toBe(true);
  });

  it('advances the cursor without resetting after a wrong key', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();

    render(<SequenceTypingGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    expect(screen.getByText('A')).toHaveAttribute('data-state', 'active');
    await user.keyboard('a');
    expect(screen.getByText('A')).toHaveAttribute('data-state', 'done');
    expect(screen.getByText('S')).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('D')).toHaveAttribute('data-state', 'todo');
    fireEvent.keyDown(window, { key: 'a', repeat: true });

    await user.keyboard('x');
    expect(screen.getByText('S')).toHaveAttribute('data-state', 'active');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith('Thử lại nhé! Tìm phím S trên bàn phím nhé.');

    await user.keyboard('sd');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });

  it('ignores Space and blocks its default so a focused button is not pressed', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<SequenceTypingGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    expect(fireEvent.keyDown(window, { key: ' ' })).toBe(false);
    expect(onRetry).not.toHaveBeenCalled();

    await user.keyboard('asd');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
  });
});
