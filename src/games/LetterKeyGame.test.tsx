import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LetterKeyGame from './LetterKeyGame';

describe('LetterKeyGame', () => {
  it('counts attempts and completes on the expected key', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();

    render(
      <LetterKeyGame
        roundIndex={0}
        totalRounds={10}
        onRoundComplete={onRoundComplete}
        onRetry={onRetry}
        speak={() => {}}
      />,
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'a', repeat: true });
    expect(onRoundComplete).not.toHaveBeenCalled();

    await user.keyboard('x');
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledTimes(1);

    await user.keyboard('a');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
