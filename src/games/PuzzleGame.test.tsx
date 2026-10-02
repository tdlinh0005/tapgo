import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FUN_SETS, PUZZLE_PICTURES, type PuzzleSet } from './funGames';
import { createPuzzleGame } from './PuzzleGame';

const PuzzleGame = createPuzzleGame(FUN_SETS['fun-puzzle'] as PuzzleSet);

afterEach(() => {
  vi.restoreAllMocks();
});

const pieces = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.puzzle-piece'));
const cellFor = (container: HTMLElement, piece: HTMLElement) => container.querySelector<HTMLElement>(`[data-puzzle-cell="${piece.dataset.piece}"]`)!;

let pointerId = 0;
const dropOn = (piece: HTMLElement, target: HTMLElement | null) => {
  pointerId += 1;
  vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(target);
  fireEvent.pointerDown(piece, { pointerId, isPrimary: true, clientX: 0, clientY: 0 });
  fireEvent.pointerUp(piece, { pointerId, clientX: 40, clientY: 40 });
};

const renderGame = (assistLevel: 0 | 1 = 0) => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const { container } = render(<PuzzleGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} assistLevel={assistLevel} />);
  return { container, onRoundComplete, onRetry };
};

describe('PuzzleGame', () => {
  it('builds the picture from four quarter pieces dropped on their own cells', () => {
    const { container, onRoundComplete, onRetry } = renderGame();
    const shown = pieces(container);
    expect(shown).toHaveLength(4);
    expect(new Set(shown.map((piece) => piece.dataset.piece))).toEqual(new Set(['0', '1', '2', '3']));
    expect(screen.getByRole('group', { name: /^Khung tranh / })).toBeInTheDocument();
    expect(PUZZLE_PICTURES.some(({ name }) => screen.queryByText(`Ghép tranh ${name}`))).toBe(true);

    dropOn(shown[0], cellFor(container, shown[0]));
    expect(pieces(container)).toHaveLength(3);
    expect(cellFor(container, shown[0])).toHaveAttribute('data-state', 'placed');

    for (const piece of shown.slice(1)) dropOn(piece, cellFor(container, piece));
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 4, attempts: 4 });
  });

  it('sends a piece dropped on the wrong cell back to the tray and counts the try', () => {
    const { container, onRoundComplete, onRetry } = renderGame();
    const shown = pieces(container);
    const wrong = container.querySelector<HTMLElement>(`[data-puzzle-cell]:not([data-puzzle-cell="${shown[0].dataset.piece}"])`)!;

    dropOn(shown[0], wrong);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('hình mờ'));
    expect(pieces(container)).toHaveLength(4);

    for (const piece of shown) dropOn(piece, cellFor(container, piece));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 4, attempts: 5 });
  });

  it('marks the cell of the next tray piece for assist', () => {
    const { container } = renderGame(1);
    const [first, second] = pieces(container);
    expect(container.querySelector('[data-assist]')).toBe(cellFor(container, first));
    dropOn(first, cellFor(container, first));
    expect(container.querySelector('[data-assist]')).toBe(cellFor(container, second));
  });
});
