import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SequenceTypingGame from './SequenceTypingGame';

describe('SequenceTypingGame', () => {
  it('advances the cursor without resetting after a wrong key', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();

    render(<SequenceTypingGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    expect(screen.getByText('A')).toHaveAttribute('data-active', 'true');
    await user.keyboard('a');
    expect(screen.getByText('S')).toHaveAttribute('data-active', 'true');
    fireEvent.keyDown(window, { key: 'a', repeat: true });

    await user.keyboard('x');
    expect(screen.getByText('S')).toHaveAttribute('data-active', 'true');
    expect(onRetry).toHaveBeenCalledTimes(1);

    await user.keyboard('sd');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });
});
