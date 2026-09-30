import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DragSortGame from './DragSortGame';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DragSortGame', () => {
  it('resets after a wrong drop and completes after the correct drop', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const speak = vi.fn();
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith('Kéo quả táo vào giỏ');

    expect(screen.getByText('Giỏ')).toBeInTheDocument();
    expect(screen.getByText('Hộp')).toBeInTheDocument();
    expect(screen.queryByText('Đúng nơi')).not.toBeInTheDocument();
    expect(screen.queryByText('Nơi khác')).not.toBeInTheDocument();

    const item = screen.getByTestId('drag-item');
    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(screen.getByTestId('wrong-zone'));

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 10 });
    expect(item).toHaveClass('is-dragging');
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 40, clientY: 30 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 40, clientY: 30 });

    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(item).not.toHaveClass('is-dragging');
    expect(item).toHaveStyle({ transform: 'translate(0px, 0px)' });

    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(screen.getByTestId('correct-zone'));
    fireEvent.pointerDown(item, { pointerId: 2, isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 2, clientX: 80, clientY: 50 });

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });

  it('ignores a tap without movement', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-item');
    const elementFromPoint = vi.spyOn(document, 'elementFromPoint').mockReturnValue(screen.getByTestId('correct-zone'));

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(elementFromPoint).not.toHaveBeenCalled();
    expect(item).not.toHaveClass('is-dragging');

    fireEvent.pointerDown(item, { pointerId: 2, isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 2, clientX: 80, clientY: 50 });

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });

  it('counts a drop inside the wrong zone as wrong even near the correct zone', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-item');
    vi.spyOn(screen.getByTestId('correct-zone'), 'getBoundingClientRect').mockReturnValue({ left: 100, right: 200, top: 100, bottom: 200, width: 100, height: 100 } as DOMRect);
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(screen.getByTestId('wrong-zone'));

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 210, clientY: 150 });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRoundComplete).not.toHaveBeenCalled();
  });

  it('does not start a drag from a non-primary button or pointer', () => {
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={vi.fn()} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-item');

    fireEvent.pointerDown(item, { pointerId: 1, button: 2, isPrimary: true, clientX: 10, clientY: 10 });
    expect(item).not.toHaveClass('is-dragging');

    fireEvent.pointerDown(item, { pointerId: 2, button: 0, isPrimary: false, clientX: 10, clientY: 10 });
    expect(item).not.toHaveClass('is-dragging');
  });

  it.each([
    [0, 220, true],
    [0, 235, false],
    [1, 235, true],
    [1, 245, false],
  ] as const)('snaps near the correct zone with assist %i at x=%i: %s', (assistLevel, x, completes) => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} assistLevel={assistLevel} />);
    const item = screen.getByTestId('drag-item');
    vi.spyOn(screen.getByTestId('correct-zone'), 'getBoundingClientRect').mockReturnValue({ left: 100, right: 200, top: 100, bottom: 200, width: 100, height: 100 } as DOMRect);
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: x, clientY: 150 });

    expect(onRoundComplete).toHaveBeenCalledTimes(completes ? 1 : 0);
    expect(onRetry).toHaveBeenCalledTimes(completes ? 0 : 1);
  });

  it('resets without judging when the pointer is cancelled', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-item');

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 60, clientY: 40 });
    fireEvent.pointerCancel(item, { pointerId: 1 });

    expect(item).not.toHaveClass('is-dragging');
    expect(item).toHaveStyle({ transform: 'translate(0px, 0px)' });
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('resets when pointer capture is lost', () => {
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={vi.fn()} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-item');

    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 40, clientY: 30 });
    fireEvent.lostPointerCapture(item, { pointerId: 1 });

    expect(item).not.toHaveClass('is-dragging');
    expect(item).toHaveStyle({ transform: 'translate(0px, 0px)' });
  });
});
