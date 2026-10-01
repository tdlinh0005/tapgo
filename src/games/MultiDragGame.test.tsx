import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOUSE_DRILL_SETS, SORT_GROUPS, type MultiDragSet } from './mouseDrills';
import { createMultiDragGame } from './MultiDragGame';

const DragManyGame = createMultiDragGame(MOUSE_DRILL_SETS['mouse-drag-many'] as MultiDragSet);
const DragGroupsGame = createMultiDragGame(MOUSE_DRILL_SETS['mouse-drag-groups'] as MultiDragSet);

afterEach(() => {
  vi.restoreAllMocks();
});

const groupOf = (name: string) => SORT_GROUPS.find(({ items }) => items.some((item) => item.name === name))!;
const pieces = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.multi-drag-item'));
const zones = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('[data-sort-zone]'));
const zoneFor = (container: HTMLElement, piece: HTMLElement) => container.querySelector<HTMLElement>(`[data-sort-zone="${groupOf(piece.getAttribute('aria-label')!).id}"]`)!;

let pointerId = 0;
const dropOn = (piece: HTMLElement, target: HTMLElement | null) => {
  pointerId += 1;
  vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(target);
  fireEvent.pointerDown(piece, { pointerId, isPrimary: true, clientX: 0, clientY: 0 });
  fireEvent.pointerUp(piece, { pointerId, clientX: 40, clientY: 40 });
};

const renderGame = (Game: typeof DragManyGame, assistLevel: 0 | 1 = 0) => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const speak = vi.fn();
  const { container } = render(<Game roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} assistLevel={assistLevel} />);
  return { container, onRoundComplete, onRetry, speak };
};

describe('MultiDragGame', () => {
  it('moves three pictures of one group into its single place', () => {
    const { container, onRoundComplete, onRetry, speak } = renderGame(DragManyGame);
    const shown = pieces(container);
    expect(shown).toHaveLength(3);
    expect(zones(container)).toHaveLength(1);
    const [zone] = zones(container);
    expect(new Set(shown.map((piece) => groupOf(piece.getAttribute('aria-label')!).id))).toEqual(new Set([zone.dataset.sortZone]));

    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith(expect.stringMatching(/^Kéo .+ vào /));

    dropOn(shown[0], zone);
    expect(pieces(container)).toHaveLength(2);
    expect(within(zone).getByLabelText(/^Đã kéo vào/)).toHaveTextContent(shown[0].textContent!);

    dropOn(shown[1], zone);
    expect(onRoundComplete).not.toHaveBeenCalled();
    dropOn(shown[2], zone);
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
  });

  it('keeps a picture dropped outside every place and counts the miss', () => {
    const { container, onRoundComplete, onRetry } = renderGame(DragManyGame);
    const shown = pieces(container);
    const [zone] = zones(container);

    dropOn(shown[0], null);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(pieces(container)).toHaveLength(3);

    for (const piece of shown) dropOn(piece, zone);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });

  it('sorts four mixed pictures into the right one of two places', () => {
    const { container, onRoundComplete, onRetry } = renderGame(DragGroupsGame);
    const shown = pieces(container);
    expect(shown).toHaveLength(4);
    expect(zones(container)).toHaveLength(2);
    for (const zone of zones(container)) {
      expect(shown.filter((piece) => zoneFor(container, piece) === zone)).toHaveLength(2);
    }

    const wrongZone = zones(container).find((zone) => zone !== zoneFor(container, shown[0]))!;
    dropOn(shown[0], wrongZone);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(pieces(container)).toContain(shown[0]);

    for (const piece of shown) dropOn(piece, zoneFor(container, piece));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 4, attempts: 5 });
  });

  it('marks the place of the next picture for assist', () => {
    const { container } = renderGame(DragGroupsGame, 1);
    const [first, second] = pieces(container);
    expect(container.querySelector('[data-assist]')).toBe(zoneFor(container, first));

    dropOn(first, zoneFor(container, first));
    expect(container.querySelector('[data-assist]')).toBe(zoneFor(container, second));
  });
});
