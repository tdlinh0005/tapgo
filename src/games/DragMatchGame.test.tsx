import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DragMatchGame from './DragMatchGame';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DragMatchGame', () => {
  it('matches the source to the correct labeled destination', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const speak = vi.fn();
    render(<DragMatchGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith('Kéo hình vào đúng tên: Mèo');

    expect(screen.getByText('Mèo')).toBeInTheDocument();
    const item = screen.getByTestId('drag-match-item');

    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(screen.getByTestId('match-Chó'));
    fireEvent.pointerDown(item, { pointerId: 1, isPrimary: true, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 20, clientY: 20 });
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledTimes(1);

    vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(screen.getByTestId('match-Mèo'));
    fireEvent.pointerDown(item, { pointerId: 2, isPrimary: true, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(item, { pointerId: 2, clientX: 30, clientY: 30 });

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
