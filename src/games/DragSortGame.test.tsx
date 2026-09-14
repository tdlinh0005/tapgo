import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DragSortGame from './DragSortGame';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DragSortGame', () => {
  it('resets after a wrong drop and completes after the correct drop', () => {
    const onRoundComplete = vi.fn();
    render(<DragSortGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} speak={() => {}} />);

    const item = screen.getByTestId('drag-item');
    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(screen.getByTestId('wrong-zone'));

    fireEvent.pointerDown(item, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 40, clientY: 30 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 40, clientY: 30 });

    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(item).toHaveStyle({ transform: 'translate(0px, 0px)' });

    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(screen.getByTestId('correct-zone'));
    fireEvent.pointerDown(item, { pointerId: 2, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(item, { pointerId: 2, clientX: 80, clientY: 50 });

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
