import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { shownText } from '../test/shownText';
import WordTypingGame, { WORDS } from './WordTypingGame';

describe('WordTypingGame', () => {
  it('keeps 20-30 unique plain words, each with a picture, including four-letter words', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(20);
    expect(WORDS.length).toBeLessThanOrEqual(30);
    expect(new Set(WORDS.map(({ word }) => word)).size).toBe(WORDS.length);
    for (const { word, emoji } of WORDS) {
      expect(word).toMatch(/^[A-Z]{2,4}$/);
      expect(emoji).not.toBe('');
    }
    expect(WORDS.some(({ word }) => word.length === 4)).toBe(true);
  });

  it('shows the picture of the word next to its letters', () => {
    const { container } = render(<WordTypingGame roundIndex={7} totalRounds={8} onRoundComplete={vi.fn()} speak={() => {}} />);

    expect(shownText(container.querySelector('.typing-picture'))).toBe('🐟');
    expect(screen.getByRole('img', { name: 'CA' })).toBeInTheDocument();
  });

  it('keeps the cursor on mistakes and completes the word', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<WordTypingGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    expect(screen.getByText('M')).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('E')).toHaveAttribute('data-state', 'todo');
    await user.keyboard('m');
    expect(screen.getByText('M')).toHaveAttribute('data-state', 'done');
    expect(screen.getByText('E')).toHaveAttribute('data-state', 'active');
    fireEvent.keyDown(window, { key: 'm', repeat: true });

    await user.keyboard('x');
    expect(screen.getByText('E')).toHaveAttribute('data-state', 'active');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith('Thử lại nhé! Tìm phím E trên bàn phím nhé.');

    await user.keyboard('e');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 3 });
  });

  it('ignores Space and blocks its default so a focused button is not pressed', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<WordTypingGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    expect(fireEvent.keyDown(window, { key: ' ' })).toBe(false);
    expect(onRetry).not.toHaveBeenCalled();

    await user.keyboard('me');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 2 });
  });
});
