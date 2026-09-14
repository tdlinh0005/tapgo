import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FindKeyGame from './FindKeyGame';

describe('FindKeyGame', () => {
  it('shows the requested key and completes from the physical keyboard', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const speak = vi.fn();

    render(<FindKeyGame roundIndex={1} totalRounds={10} onRoundComplete={onRoundComplete} speak={speak} />);

    expect(screen.getByText('Hãy bấm chữ M')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith('Hãy bấm chữ M');

    await user.keyboard('m');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });
});
