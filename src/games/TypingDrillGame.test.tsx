import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DRILL_SETS } from './drills';
import { createTypingDrillGame } from './TypingDrillGame';

const TwoWordsGame = createTypingDrillGame(DRILL_SETS['drill-two-words']);
const SentenceEnterGame = createTypingDrillGame(DRILL_SETS['drill-sentence-enter']);

const cells = (container: HTMLElement) => Array.from(container.querySelectorAll('.typing-sequence span'));

describe('TypingDrillGame', () => {
  it('completes a two-word item typed with Space', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const { container } = render(<TwoWordsGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} speak={vi.fn()} />);

    expect(cells(container).map((cell) => cell.textContent)).toEqual(['B', 'E', '␣', 'A', 'N']);
    expect(screen.getByRole('img', { name: 'phím cách' })).toHaveAttribute('data-key', 'space');
    await user.keyboard('be an');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 5, attempts: 5 });
  });

  it('needs Enter to finish a sentence in the last set', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    render(<SentenceEnterGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} speak={vi.fn()} />);

    expect(screen.getByRole('img', { name: 'phím Enter' })).toHaveTextContent('⏎');
    await user.keyboard('be yeu me');
    expect(onRoundComplete).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 10, attempts: 10 });
  });

  it('keeps the cursor on a wrong key and hints the missed Space', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const { container } = render(<TwoWordsGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} />);

    await user.keyboard('bex');
    expect(onRetry).toHaveBeenCalledWith('Thử lại nhé! Tìm phím cách trên bàn phím nhé.');
    expect(cells(container)[2]).toHaveAttribute('data-state', 'active');

    await user.keyboard(' an');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 5, attempts: 6 });
  });

  it('marks only the active key for assist', async () => {
    const user = userEvent.setup();
    const { container } = render(<TwoWordsGame roundIndex={0} totalRounds={6} onRoundComplete={vi.fn()} speak={vi.fn()} assistLevel={2} />);

    await user.keyboard('b');
    const assisted = container.querySelectorAll('[data-assist]');
    expect(assisted).toHaveLength(1);
    expect(assisted[0]).toBe(cells(container)[1]);
    expect(assisted[0]).toHaveAttribute('data-assist', '2');
  });

  it('uses compact key cells only for items of 11 keys or more', () => {
    const { container, unmount } = render(<TwoWordsGame roundIndex={0} totalRounds={6} onRoundComplete={vi.fn()} speak={vi.fn()} />);
    expect(container.querySelector('.typing-sequence')).not.toHaveAttribute('data-size');
    unmount();

    const long = render(<SentenceEnterGame roundIndex={11} totalRounds={6} onRoundComplete={vi.fn()} speak={vi.fn()} />);
    expect(cells(long.container)).toHaveLength(14);
    expect(long.container.querySelector('.typing-sequence')).toHaveAttribute('data-size', 'compact');
  });

  it('reads the accented sentence aloud', async () => {
    const user = userEvent.setup();
    const speak = vi.fn();
    render(<TwoWordsGame roundIndex={0} totalRounds={6} onRoundComplete={vi.fn()} speak={speak} />);

    await user.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith('Gõ: Bé ăn');
  });
});
