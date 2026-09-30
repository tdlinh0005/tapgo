import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ClickTargetGame, { SAFE_AREA } from './ClickTargetGame';

afterEach(() => {
  vi.restoreAllMocks();
});

const renderGame = () => render(<ClickTargetGame roundIndex={0} totalRounds={12} onRoundComplete={vi.fn()} speak={() => {}} />);

describe('ClickTargetGame', () => {
  it('counts background misses and completes on the target', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();

    render(
      <ClickTargetGame
        roundIndex={0}
        totalRounds={12}
        onRoundComplete={onRoundComplete}
        onRetry={onRetry}
        speak={() => {}}
      />,
    );

    await user.click(screen.getByText('Click vào ngôi sao'));
    await user.click(screen.getByTestId('play-area'));
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Mục tiêu' }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });

  it('places the target at a random position inside the safe area on each mount', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const first = renderGame();
    expect(screen.getByRole('button', { name: 'Mục tiêu' })).toHaveStyle({ left: `${SAFE_AREA.left[0]}%`, top: `${SAFE_AREA.top[0]}%` });
    first.unmount();

    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    renderGame();
    const target = screen.getByRole('button', { name: 'Mục tiêu' });
    const left = Number.parseFloat(target.style.left);
    const top = Number.parseFloat(target.style.top);
    expect(left).toBeGreaterThan(SAFE_AREA.left[1] - 0.01);
    expect(left).toBeLessThanOrEqual(SAFE_AREA.left[1]);
    expect(top).toBeGreaterThan(SAFE_AREA.top[1] - 0.01);
    expect(top).toBeLessThanOrEqual(SAFE_AREA.top[1]);
  });
});
