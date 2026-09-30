import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MouseTrailGame from './MouseTrailGame';

describe('MouseTrailGame', () => {
  it('completes when checkpoints are entered in order', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<MouseTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    for (let index = 0; index < 5; index += 1) {
      fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${index}`));
    }

    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 5, attempts: 5 });
  });

  it('counts an out-of-order checkpoint as a retry without resetting progress', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<MouseTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    fireEvent.pointerEnter(screen.getByTestId('checkpoint-0'));
    fireEvent.pointerEnter(screen.getByTestId('checkpoint-2'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('điểm 2'));
    expect(screen.getByTestId('checkpoint-0')).toHaveClass('is-done');
    expect(screen.getByTestId('checkpoint-1')).toHaveClass('is-next');

    fireEvent.pointerEnter(screen.getByTestId('checkpoint-0'));
    expect(onRetry).toHaveBeenCalledTimes(1);

    for (let index = 1; index < 5; index += 1) {
      fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${index}`));
    }

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 5, attempts: 6 });
  });
});
