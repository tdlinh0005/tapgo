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

    fireEvent.pointerDown(item, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(item).toHaveClass('is-dragging');
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 40, clientY: 30 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 40, clientY: 30 });

    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(item).not.toHaveClass('is-dragging');
    expect(item).toHaveStyle({ transform: 'translate(0px, 0px)' });

    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(screen.getByTestId('correct-zone'));
    fireEvent.pointerDown(item, { pointerId: 2, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 2, clientX: 80, clientY: 50 });

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });

  it('ignores a tap without movement', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} />);
    const item = screen.getByTestId('drag-item');
    const elementFromPoint = vi.spyOn(document, 'elementFromPoint').mockReturnValue(screen.getByTestId('correct-zone'));

    fireEvent.pointerDown(item, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(elementFromPoint).not.toHaveBeenCalled();
    expect(item).not.toHaveClass('is-dragging');

    fireEvent.pointerDown(item, { pointerId: 2, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 2, clientX: 80, clientY: 50 });

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });
});
