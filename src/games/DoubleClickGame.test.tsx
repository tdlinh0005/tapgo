import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pickRound } from '../game/pickRound';
import { createDoubleClickGame, DOUBLE_CLICK_WINDOW_MS, SINGLE_CLICK_HINT } from './DoubleClickGame';
import { DOUBLE_CLICK_ITEMS, MOUSE_DRILL_SETS, type DoubleClickSet } from './mouseDrills';

const DoubleClickGame = createDoubleClickGame(MOUSE_DRILL_SETS['mouse-double-click'] as DoubleClickSet);
const item = pickRound(DOUBLE_CLICK_ITEMS, 0);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const renderGame = () => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const speak = vi.fn();
  render(<DoubleClickGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} />);
  return { onRoundComplete, onRetry, speak, target: screen.getByRole('button', { name: item.name }) };
};

const doubleClick = (target: HTMLElement) => {
  fireEvent.click(target, { detail: 1 });
  fireEvent.click(target, { detail: 2 });
  fireEvent.doubleClick(target, { detail: 2 });
};

describe('DoubleClickGame', () => {
  it('opens on a double click without counting its two clicks as mistakes', () => {
    const { onRoundComplete, onRetry, speak, target } = renderGame();
    expect(screen.getByText(`Nháy đúp để mở ${item.name}`)).toHaveClass('game-prompt');
    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith(expect.stringContaining('bấm thật nhanh hai lần'));

    doubleClick(target);
    act(() => vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS * 2));

    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 1 });
  });

  it('hints a quick second press after a lone click and counts it as an attempt', () => {
    const { onRoundComplete, onRetry, target } = renderGame();

    fireEvent.click(target, { detail: 1 });
    act(() => vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS - 1));
    expect(onRetry).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onRetry).toHaveBeenCalledWith(SINGLE_CLICK_HINT);
    expect(SINGLE_CLICK_HINT).toContain('Bấm nhanh hai lần nhé');

    doubleClick(target);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });

  it('reports a lone click through the latest onRetry even if the parent re-rendered meanwhile', () => {
    const firstRetry = vi.fn();
    const latestRetry = vi.fn();
    const props = { roundIndex: 0, totalRounds: 6, onRoundComplete: vi.fn(), speak: vi.fn() };
    const { rerender } = render(<DoubleClickGame {...props} onRetry={firstRetry} />);

    fireEvent.click(screen.getByRole('button', { name: item.name }), { detail: 1 });
    rerender(<DoubleClickGame {...props} onRetry={latestRetry} />);
    act(() => vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS));

    expect(firstRetry).not.toHaveBeenCalled();
    expect(latestRetry).toHaveBeenCalledWith(SINGLE_CLICK_HINT);
  });

  it('treats a click outside the target as a retry', () => {
    const { onRoundComplete, onRetry } = renderGame();

    fireEvent.click(screen.getByTestId('play-area'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(undefined);
    expect(onRoundComplete).not.toHaveBeenCalled();
  });

  it('drops a pending lone-click hint when the round unmounts', () => {
    const onRetry = vi.fn();
    const { unmount } = render(<DoubleClickGame roundIndex={0} totalRounds={6} onRoundComplete={vi.fn()} onRetry={onRetry} speak={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: item.name }), { detail: 1 });
    unmount();
    act(() => vi.advanceTimersByTime(DOUBLE_CLICK_WINDOW_MS));
    expect(onRetry).not.toHaveBeenCalled();
  });
});
