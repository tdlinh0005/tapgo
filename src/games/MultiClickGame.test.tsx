import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SAFE_AREA } from './ClickTargetGame';
import { MOUSE_DRILL_SETS, type MultiClickSet } from './mouseDrills';
import { joinNames, MAX_CLICK_TARGETS, targetSlots } from './mouseLayout';
import { createMultiClickGame } from './MultiClickGame';

const ClickManyGame = createMultiClickGame(MOUSE_DRILL_SETS['mouse-click-many'] as MultiClickSet);
const ClickOrderGame = createMultiClickGame(MOUSE_DRILL_SETS['mouse-click-order'] as MultiClickSet);
const ClickSmallGame = createMultiClickGame(MOUSE_DRILL_SETS['mouse-click-small'] as MultiClickSet);

const targets = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.multi-click-target'));
const baseProps = { totalRounds: 6, speak: vi.fn() };

describe('MultiClickGame', () => {
  it('spreads targets over distinct slots inside the safe area', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const slots = targetSlots(MAX_CLICK_TARGETS, seed);
      expect(new Set(slots.map(({ left, top }) => `${left},${top}`)).size).toBe(MAX_CLICK_TARGETS);
      for (const { left, top } of slots) {
        expect(left).toBeGreaterThanOrEqual(SAFE_AREA.left[0]);
        expect(left).toBeLessThanOrEqual(SAFE_AREA.left[1]);
        expect(top).toBeGreaterThanOrEqual(SAFE_AREA.top[0]);
        expect(top).toBeLessThanOrEqual(SAFE_AREA.top[1]);
      }
    }
  });

  it('joins spoken names with a final "và"', () => {
    expect(joinNames(['quả táo'])).toBe('quả táo');
    expect(joinNames(['quả táo', 'con cá', 'ngôi sao'])).toBe('quả táo, con cá và ngôi sao');
  });

  it('lays out the same round the same way for the same session seed', () => {
    const layout = () => {
      const { container, unmount } = render(<ClickManyGame {...baseProps} roundIndex={2} sessionSeed={99} onRoundComplete={vi.fn()} />);
      const result = targets(container).map((target) => `${target.textContent}@${target.style.left},${target.style.top}`);
      unmount();
      return result;
    };
    expect(layout()).toEqual(layout());
  });

  it('completes after every target is clicked in any order and counts background misses', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const speak = vi.fn();
    const { container } = render(<ClickManyGame {...baseProps} speak={speak} roundIndex={0} onRoundComplete={onRoundComplete} onRetry={onRetry} />);
    const shown = targets(container);
    expect(shown).toHaveLength(3);
    shown.forEach((target) => expect(target).toHaveAttribute('data-size', 'medium'));

    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith(expect.stringContaining(shown[0].getAttribute('aria-label')!));

    fireEvent.click(shown[2]);
    expect(shown[2]).toHaveAttribute('data-state', 'done');
    fireEvent.click(shown[2]);
    expect(onRetry).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('play-area'));
    expect(onRetry).toHaveBeenCalledTimes(1);

    fireEvent.click(shown[0]);
    expect(onRoundComplete).not.toHaveBeenCalled();
    fireEvent.click(shown[1]);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });

  it('needs the numbered bubbles in order and hints the number to click first', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<ClickOrderGame {...baseProps} roundIndex={0} onRoundComplete={onRoundComplete} onRetry={onRetry} />);
    expect(screen.getByText('Click theo số từ 1 đến 4')).toHaveClass('game-prompt');
    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(baseProps.speak).toHaveBeenLastCalledWith('Click các hình theo số, từ số 1 đến số 4');

    fireEvent.click(screen.getByRole('button', { name: 'Số 2' }));
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('Click số 1 trước nhé'));
    expect(screen.getByRole('button', { name: 'Số 2' })).not.toHaveAttribute('data-state');

    for (const number of [1, 2, 3]) fireEvent.click(screen.getByRole('button', { name: `Số ${number}` }));
    expect(onRoundComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Số 4' }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 4, attempts: 5 });
  });

  it('alternates 4 and 5 bubbles and marks the next number for assist', () => {
    const { container } = render(<ClickOrderGame {...baseProps} roundIndex={1} onRoundComplete={vi.fn()} assistLevel={1} />);
    expect(targets(container)).toHaveLength(5);
    expect(container.querySelector('[data-assist]')).toBe(screen.getByRole('button', { name: 'Số 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Số 1' }));
    expect(container.querySelector('[data-assist]')).toBe(screen.getByRole('button', { name: 'Số 2' }));
  });

  it('shows five small targets in the small-target set', () => {
    const { container } = render(<ClickSmallGame {...baseProps} roundIndex={0} onRoundComplete={vi.fn()} />);
    const shown = targets(container);
    expect(shown).toHaveLength(5);
    shown.forEach((target) => expect(target).toHaveAttribute('data-size', 'small'));
  });
});
