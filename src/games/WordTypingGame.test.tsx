import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import WordTypingGame from './WordTypingGame';

describe('WordTypingGame', () => {
  it('keeps the cursor on mistakes and completes the word', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    render(<WordTypingGame roundIndex={0} totalRounds={8} onRoundComplete={onRoundComplete} speak={() => {}} />);

    expect(screen.getByText('M')).toHaveAttribute('data-active', 'true');
    await user.keyboard('m');
    expect(screen.getByText('E')).toHaveAttribute('data-active', 'true');

    await user.keyboard('x');
    expect(screen.getByText('E')).toHaveAttribute('data-active', 'true');

    await user.keyboard('e');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 3 });
  });
});
