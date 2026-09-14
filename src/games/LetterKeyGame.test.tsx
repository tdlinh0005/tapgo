import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LetterKeyGame from './LetterKeyGame';

describe('LetterKeyGame', () => {
  it('counts attempts and completes on the expected key', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();

    render(
      <LetterKeyGame
        roundIndex={0}
        totalRounds={10}
        onRoundComplete={onRoundComplete}
        speak={() => {}}
      />,
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    await user.keyboard('x');
    expect(onRoundComplete).not.toHaveBeenCalled();

    await user.keyboard('a');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
