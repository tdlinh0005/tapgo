import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DragMatchGame from './DragMatchGame';

afterEach(() => {
  vi.restoreAllMocks();
});

const zone = (container: HTMLElement, label: string) => container.querySelector<HTMLElement>(`[data-match-label="${label}"]`)!;

describe('DragMatchGame', () => {
  it('matches the picture to its shadow without visible words on the targets', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const speak = vi.fn();
    const { container } = render(<DragMatchGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith('Kéo mèo vào đúng cái bóng của nó');

    for (const label of ['Mèo', 'Cá', 'Cây']) {
      expect(zone(container, label)).toHaveTextContent(/^\P{L}*$/u);
      expect(zone(container, label).querySelector('.match-shadow')).toBeInTheDocument();
    }
    expect(screen.getByRole('img', { name: 'Bóng của mèo' })).toBe(zone(container, 'Mèo'));

    const item = screen.getByTestId('drag-match-item');
    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(zone(container, 'Cá'));
    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 20, clientY: 20 });
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledTimes(1);

    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(zone(container, 'Mèo'));
    fireEvent.pointerDown(item, { pointerId: 2, isPrimary: true, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(item, { pointerId: 2, clientX: 30, clientY: 30 });

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });

  it.each([
    [0, 220, true],
    [0, 235, false],
    [1, 235, true],
    [1, 245, false],
  ] as const)('snaps near the correct shadow with assist %i at x=%i: %s', (assistLevel, x, completes) => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const { container } = render(<DragMatchGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} assistLevel={assistLevel} />);
    const item = screen.getByTestId('drag-match-item');
    vi.spyOn(zone(container, 'Mèo'), 'getBoundingClientRect').mockReturnValue({ left: 100, right: 200, top: 100, bottom: 200, width: 100, height: 100 } as DOMRect);
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: x, clientY: 150 });

    expect(onRoundComplete).toHaveBeenCalledTimes(completes ? 1 : 0);
    expect(onRetry).toHaveBeenCalledTimes(completes ? 0 : 1);
  });

  it('resets without judging when the pointer is cancelled', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<DragMatchGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-match-item');

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 50, clientY: 30 });
    fireEvent.pointerCancel(item, { pointerId: 1 });

    expect(item).toHaveStyle({ transform: 'translate(0px, 0px)' });
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('counts a drop inside a wrong zone as wrong even near the correct zone', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const { container } = render(<DragMatchGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-match-item');
    vi.spyOn(zone(container, 'Mèo'), 'getBoundingClientRect').mockReturnValue({ left: 100, right: 200, top: 100, bottom: 200, width: 100, height: 100 } as DOMRect);
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(zone(container, 'Cá'));

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 210, clientY: 150 });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRoundComplete).not.toHaveBeenCalled();
  });
});
