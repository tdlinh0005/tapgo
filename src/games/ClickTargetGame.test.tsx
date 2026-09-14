import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ClickTargetGame from './ClickTargetGame';

describe('ClickTargetGame', () => {
  it('counts background misses and completes on the target', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();

    render(
      <ClickTargetGame
        roundIndex={0}
        totalRounds={12}
        onRoundComplete={onRoundComplete}
        speak={() => {}}
      />,
    );

    await user.click(screen.getByTestId('play-area'));
    expect(onRoundComplete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Mục tiêu' }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
