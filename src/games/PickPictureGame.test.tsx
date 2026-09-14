import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PickPictureGame from './PickPictureGame';

describe('PickPictureGame', () => {
  it('counts a wrong picture before the correct choice', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();

    render(<PickPictureGame roundIndex={0} totalRounds={10} onRoundComplete={onRoundComplete} speak={() => {}} />);

    expect(screen.getByText('Click con mèo')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '🐶' }));
    expect(onRoundComplete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '🐱' }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
