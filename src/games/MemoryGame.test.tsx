import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FUN_SETS, type MemorySet } from './funGames';
import { createMemoryGame, memoryOutcome } from './MemoryGame';

const MemoryGame = createMemoryGame(FUN_SETS['fun-memory'] as MemorySet);

const renderGame = (roundIndex = 0) => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const { container } = render(<MemoryGame roundIndex={roundIndex} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} assistLevel={1} />);
  return { container, onRoundComplete, onRetry };
};

const cards = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.memory-card'));
const assisted = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-assist]')!;
const nameOf = (card: HTMLElement) => card.getAttribute('aria-label')!.split(': ')[1];

const matchOnePair = (container: HTMLElement) => {
  fireEvent.click(assisted(container));
  fireEvent.click(assisted(container));
};

describe('memoryOutcome', () => {
  it('lets mismatches up to the number of pairs go free', () => {
    expect(memoryOutcome(3, 0)).toEqual({ correct: 3, attempts: 3 });
    expect(memoryOutcome(3, 3)).toEqual({ correct: 3, attempts: 3 });
    expect(memoryOutcome(3, 5)).toEqual({ correct: 3, attempts: 5 });
  });
});

describe('MemoryGame', () => {
  it('deals face-down pairs and finishes when every pair is found', () => {
    const { container, onRoundComplete, onRetry } = renderGame();
    expect(cards(container)).toHaveLength(6);
    expect(container.querySelector('.memory-board')).toHaveAttribute('data-cards', '6');
    expect(cards(container).every((card) => !card.dataset.state)).toBe(true);

    fireEvent.click(assisted(container));
    const first = container.querySelector<HTMLElement>('[data-state="up"]')!;
    fireEvent.click(assisted(container));
    expect(container.querySelectorAll('[data-state="matched"]')).toHaveLength(2);
    expect(nameOf(container.querySelectorAll<HTMLElement>('[data-state="matched"]')[1])).toBe(nameOf(first));

    matchOnePair(container);
    expect(onRoundComplete).not.toHaveBeenCalled();
    matchOnePair(container);
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
  });

  it('keeps a mismatched pair face up until the next click, with no timer', () => {
    const { container, onRoundComplete } = renderGame(1);
    expect(cards(container)).toHaveLength(8);
    const all = cards(container);
    fireEvent.click(all[0]);
    const wrong = all.find((card, index) => index > 0 && card !== assisted(container))!;
    fireEvent.click(wrong);
    expect(container.querySelectorAll('[data-state="up"]')).toHaveLength(2);

    fireEvent.click(all.find((card) => card !== all[0] && card !== wrong)!);
    expect(container.querySelectorAll('[data-state="up"]')).toHaveLength(1);
    fireEvent.click(assisted(container));
    for (let pair = 1; pair < 4; pair += 1) matchOnePair(container);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 4, attempts: 4 });
  });

  it('hints only after more mismatches than pairs', () => {
    const { container, onRetry } = renderGame();
    const all = cards(container);
    for (let miss = 0; miss < 4; miss += 1) {
      fireEvent.click(all[0]);
      fireEvent.click(all.find((card, index) => index > 0 && card !== assisted(container))!);
    }
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('Nhớ chỗ'));
  });
});
