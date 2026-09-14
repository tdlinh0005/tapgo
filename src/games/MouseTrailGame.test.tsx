import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MouseTrailGame from './MouseTrailGame';

describe('MouseTrailGame', () => {
  it('requires checkpoints in order without resetting on a detour', () => {
    const onRoundComplete = vi.fn();
    render(<MouseTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} speak={() => {}} />);

    fireEvent.pointerEnter(screen.getByTestId('checkpoint-1'));
    expect(onRoundComplete).not.toHaveBeenCalled();

    for (let index = 0; index < 5; index += 1) {
      fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${index}`));
    }

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 5, attempts: 5 });
  });
});
