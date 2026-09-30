import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PickPictureGame, { PICTURE_ROUNDS } from './PickPictureGame';

describe('PickPictureGame', () => {
  it('keeps about 30 pictures split evenly over four themes, each answer among three distinct options', () => {
    expect(PICTURE_ROUNDS.length).toBeGreaterThanOrEqual(28);
    const perTheme = new Map<string, number>();
    for (const round of PICTURE_ROUNDS) {
      perTheme.set(round.theme, (perTheme.get(round.theme) ?? 0) + 1);
      const options: readonly string[] = round.options;
      expect(new Set(options).size).toBe(3);
      expect(options).toContain(round.answer);
    }
    expect(perTheme.size).toBe(4);
    expect(new Set(perTheme.values()).size).toBe(1);
    expect(new Set(PICTURE_ROUNDS.map(({ answer }) => answer)).size).toBe(PICTURE_ROUNDS.length);
  });

  it('counts a wrong picture before the correct choice', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const speak = vi.fn();

    render(<PickPictureGame roundIndex={0} totalRounds={10} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} />);

    expect(screen.getByText('Click con mèo')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith('Click con mèo');

    await user.click(screen.getByRole('button', { name: '🐶' }));
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '🐱' }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
