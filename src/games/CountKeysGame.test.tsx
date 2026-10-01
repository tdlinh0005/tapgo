import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { pickRound } from '../game/pickRound';
import CountKeysGame, { COUNTS, COUNT_ITEMS } from './CountKeysGame';

const renderGame = (roundIndex: number, props: Partial<{ assistLevel: 0 | 1 | 2; sessionSeed: number }> = {}, onRoundComplete = vi.fn(), onRetry = vi.fn()) =>
  render(
    <CountKeysGame
      roundIndex={roundIndex}
      totalRounds={9}
      onRoundComplete={onRoundComplete}
      onRetry={onRetry}
      speak={() => {}}
      {...props}
    />,
  );

describe('CountKeysGame', () => {
  it('only asks for counts from 1 to 9', () => {
    expect(COUNTS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const seed of [1, 42, 12345]) {
      for (let roundIndex = 0; roundIndex < 9; roundIndex += 1) {
        const count = pickRound(COUNTS, roundIndex, seed);
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(9);
      }
    }
    expect(COUNT_ITEMS.length).toBeGreaterThan(9);
  });

  it('shows the counted pictures and completes on the right number', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const count = pickRound(COUNTS, 2);
    const item = pickRound(COUNT_ITEMS, 2);
    renderGame(2, {}, onRoundComplete);

    expect(screen.getByText(`Có mấy ${item.name}?`)).toHaveClass('game-prompt');
    expect(screen.getByRole('img', { name: `${count} ${item.name}` }).querySelectorAll('.count-item')).toHaveLength(count);
    await user.keyboard(String(count));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });

  it('gives a counting hint on a wrong number', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const count = pickRound(COUNTS, 0);
    const item = pickRound(COUNT_ITEMS, 0);
    renderGame(0, {}, vi.fn(), onRetry);

    await user.keyboard(String(count === 9 ? 1 : count + 1));
    expect(onRetry).toHaveBeenCalledWith(`Thử lại nhé! Đếm lại từng ${item.name} nhé.`);
  });

  it('accepts numpad digits', () => {
    const onRoundComplete = vi.fn();
    const count = pickRound(COUNTS, 4);
    renderGame(4, {}, onRoundComplete);

    fireEvent.keyDown(window, { key: String(count), code: `Numpad${count}` });
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });

  it('numbers the pictures at assist 1 and shows the answer at assist 2', () => {
    const count = pickRound(COUNTS, 3);
    const { container, rerender } = renderGame(3);
    expect(container.querySelectorAll('.count-number')).toHaveLength(0);
    expect(container.querySelector('.key-target')).toHaveTextContent('?');

    rerender(<CountKeysGame roundIndex={3} totalRounds={9} onRoundComplete={vi.fn()} onRetry={vi.fn()} speak={() => {}} assistLevel={1} />);
    expect(container.querySelectorAll('.count-number')).toHaveLength(count);
    expect(container.querySelector('.key-target')).toHaveTextContent('?');

    rerender(<CountKeysGame roundIndex={3} totalRounds={9} onRoundComplete={vi.fn()} onRetry={vi.fn()} speak={() => {}} assistLevel={2} />);
    expect(container.querySelector('.key-target')).toHaveTextContent(String(count));
  });
});
