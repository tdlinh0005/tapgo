import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FUN_SETS, type PopKeysSet } from './funGames';
import { createPopKeysGame } from './PopKeysGame';

const BalloonGame = createPopKeysGame(FUN_SETS['fun-balloon'] as PopKeysSet);
const FishingGame = createPopKeysGame(FUN_SETS['fun-fishing'] as PopKeysSet);

const renderGame = (Game: typeof BalloonGame, roundIndex = 0, assistLevel: 0 | 1 = 0) => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const speak = vi.fn();
  const { container } = render(<Game roundIndex={roundIndex} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} assistLevel={assistLevel} />);
  return { container, onRoundComplete, onRetry, speak };
};

const targets = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.pop-target'));
const keyOf = (target: HTMLElement) => target.getAttribute('aria-label')!.split(' ').at(-1)!;
const press = (key: string) => fireEvent.keyDown(window, { key });

describe('PopKeysGame', () => {
  it('pops balloons in any order and finishes when every shown letter is pressed', () => {
    const { container, onRoundComplete, onRetry, speak } = renderGame(BalloonGame);
    const shown = targets(container);
    expect(shown).toHaveLength(3);
    expect(screen.getByTestId('play-area')).toHaveAttribute('data-scene', 'sky');
    const keys = shown.map(keyOf);

    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith(expect.stringContaining(keys[0]));

    press(keys[2].toLowerCase());
    expect(screen.getByRole('img', { name: `Quả bóng chữ ${keys[2]} đã xong` })).toHaveAttribute('data-state', 'popped');
    press(keys[2]);
    press(keys[0]);
    expect(onRoundComplete).not.toHaveBeenCalled();
    press(keys[1]);
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
  });

  it('counts a key that is on no balloon as a miss with a gentle hint', () => {
    const { container, onRoundComplete, onRetry } = renderGame(BalloonGame, 1);
    const keys = targets(container).map(keyOf);
    expect(keys).toHaveLength(4);
    const missing = 'ABCDEGHKLMNOPSTUVXY'.split('').find((key) => !keys.includes(key))!;

    press(missing);
    press(' ');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('chữ có trên quả bóng'));
    for (const key of keys) press(key);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 4, attempts: 5 });
  });

  it('catches fish with number keys on the pond scene', () => {
    const { container, onRoundComplete } = renderGame(FishingGame);
    const shown = targets(container);
    expect(screen.getByTestId('play-area')).toHaveAttribute('data-scene', 'pond');
    expect(shown[0].getAttribute('aria-label')).toMatch(/^Con cá số [1-9]$/);
    for (const target of shown) press(keyOf(target));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
  });

  it('marks the next unpopped picture for assist', () => {
    const { container } = renderGame(BalloonGame, 0, 1);
    const [first, second] = targets(container);
    expect(container.querySelectorAll('[data-assist]')).toHaveLength(1);
    expect(first).toHaveAttribute('data-assist', '1');
    press(keyOf(first));
    expect(container.querySelector('[data-assist]')).toBe(second);
  });
});
