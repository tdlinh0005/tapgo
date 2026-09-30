import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FindKeyGame, { TARGETS } from './FindKeyGame';
import { LETTERS } from './LetterKeyGame';

describe('FindKeyGame', () => {
  it('uses letters that the letter game does not already teach', () => {
    const letters: readonly string[] = LETTERS;
    for (const target of TARGETS) expect(letters).not.toContain(target);
  });

  it('shows the requested key and completes from the physical keyboard', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const speak = vi.fn();

    render(<FindKeyGame roundIndex={1} totalRounds={10} onRoundComplete={onRoundComplete} speak={speak} />);

    expect(screen.getByText('Hãy bấm chữ G')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith('Hãy bấm chữ G');

    await user.keyboard('g');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });
});
