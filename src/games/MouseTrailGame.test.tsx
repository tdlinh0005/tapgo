import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MouseTrailGame, { TRAILS, TRAIL_THEMES } from './MouseTrailGame';

const firstTrailLength = TRAILS[0].length;

describe('MouseTrailGame', () => {
  it('has a start, 4-6 checkpoints and a finish on every trail', () => {
    expect(TRAILS.length).toBeGreaterThanOrEqual(10);
    expect(TRAILS.length).toBeLessThanOrEqual(12);
    for (const trail of TRAILS) {
      expect(trail.length).toBeGreaterThanOrEqual(6);
      expect(trail.length).toBeLessThanOrEqual(8);
    }
  });

  it('draws the guide line through the checkpoints of the round', () => {
    const { container } = render(<MouseTrailGame roundIndex={2} totalRounds={6} onRoundComplete={vi.fn()} speak={() => {}} />);

    expect(container.querySelector('.trail-guide polyline')).toHaveAttribute('points', TRAILS[2].map(([x, y]) => `${x},${y}`).join(' '));
    expect(screen.getByLabelText('Điểm bắt đầu')).toBeInTheDocument();
    expect(screen.getByLabelText('Đích')).toBeInTheDocument();
    expect(screen.getByText(`Đưa ${TRAIL_THEMES[2].start} tới ${TRAIL_THEMES[2].finish}`)).toHaveClass('game-prompt');
    expect(screen.getByLabelText('Điểm bắt đầu')).toHaveTextContent(TRAIL_THEMES[2].start);
    expect(screen.getByLabelText('Đích')).toHaveTextContent(TRAIL_THEMES[2].finish);
  });

  it('pairs every start with a different finish and reads the goal aloud', () => {
    expect(TRAIL_THEMES.length).toBeGreaterThan(TRAILS.length / 2);
    for (const theme of TRAIL_THEMES) expect(theme.start).not.toBe(theme.finish);

    const speak = vi.fn();
    render(<MouseTrailGame roundIndex={1} totalRounds={6} onRoundComplete={vi.fn()} speak={speak} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith(expect.stringContaining(TRAIL_THEMES[1].goal));
  });

  it('completes when checkpoints are entered in order', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<MouseTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    for (let index = 0; index < firstTrailLength; index += 1) {
      fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${index}`));
    }

    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: firstTrailLength, attempts: firstTrailLength });
  });

  it('ignores checkpoints entered before the start, such as a cursor resting where the game opens', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<MouseTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    fireEvent.pointerEnter(screen.getByTestId('checkpoint-3'));
    fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${firstTrailLength - 1}`));

    expect(onRetry).not.toHaveBeenCalled();
    expect(screen.getByTestId('checkpoint-0')).toHaveClass('is-next');
  });

  it('does not count the trip back to the start across the new trail as mistakes', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<MouseTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    for (const index of [5, 4, 2, 1]) {
      fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${index}`));
    }
    for (let index = 0; index < firstTrailLength; index += 1) {
      fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${index}`));
    }

    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: firstTrailLength, attempts: firstTrailLength });
  });

  it('counts an out-of-order checkpoint as a retry without resetting progress', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<MouseTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    fireEvent.pointerEnter(screen.getByTestId('checkpoint-0'));
    fireEvent.pointerEnter(screen.getByTestId('checkpoint-2'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('điểm 1'));
    expect(screen.getByTestId('checkpoint-0')).toHaveClass('is-done');
    expect(screen.getByTestId('checkpoint-1')).toHaveClass('is-next');

    fireEvent.pointerEnter(screen.getByTestId('checkpoint-0'));
    expect(onRetry).toHaveBeenCalledTimes(1);

    for (let index = 1; index < firstTrailLength; index += 1) {
      fireEvent.pointerEnter(screen.getByTestId(`checkpoint-${index}`));
    }

    expect(onRoundComplete).toHaveBeenCalledWith({ correct: firstTrailLength, attempts: firstTrailLength + 1 });
  });
});
