import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LONG_TRAILS, MOUSE_DRILL_SETS, type TrailSet } from './mouseDrills';
import MouseTrailGame, { createMouseTrailGame, RELEASE_HINT, TRAILS, TRAIL_THEMES } from './MouseTrailGame';

const firstTrailLength = TRAILS[0].length;

const trailGameFor = (set: TrailSet) => createMouseTrailGame({ trails: set.items, checkpointSize: set.checkpointSize, hold: set.hold });
const LongTrailGame = trailGameFor(MOUSE_DRILL_SETS['mouse-trail-long'] as TrailSet);
const HoldTrailGame = trailGameFor(MOUSE_DRILL_SETS['mouse-hold-trail'] as TrailSet);

const held = { buttons: 1 };
const checkpoint = (index: number) => screen.getByTestId(`checkpoint-${index}`);
const pressStart = () => fireEvent.pointerDown(checkpoint(0), { button: 0, buttons: 1, isPrimary: true });
const dragThrough = (from: number, to: number) => {
  for (let index = from; index <= to; index += 1) fireEvent.pointerEnter(checkpoint(index), held);
};

const renderHold = () => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const speak = vi.fn();
  const { container } = render(<HoldTrailGame roundIndex={0} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={speak} />);
  return { onRoundComplete, onRetry, speak, area: container.querySelector<HTMLElement>('.trail-area')! };
};

describe('long trail drill', () => {
  it('draws 9 to 12 small checkpoints and completes them in order', () => {
    const onRoundComplete = vi.fn();
    const { container } = render(<LongTrailGame roundIndex={3} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={vi.fn()} speak={vi.fn()} />);
    const length = LONG_TRAILS[3].length;

    expect(container.querySelector('.trail-area')).toHaveAttribute('data-size', 'small');
    expect(container.querySelector('.trail-area')).not.toHaveAttribute('data-hold');
    expect(container.querySelectorAll('.trail-checkpoint')).toHaveLength(length);
    for (let index = 0; index < length; index += 1) fireEvent.pointerEnter(checkpoint(index));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: length, attempts: length });
  });
});

describe('hold trail drill', () => {
  it('completes when the left button is held from the start to the finish', () => {
    const { onRoundComplete, onRetry, speak, area } = renderHold();
    expect(area).toHaveAttribute('data-hold', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Nghe yêu cầu' }));
    expect(speak).toHaveBeenCalledWith(expect.stringContaining('Giữ chặt nút chuột trái'));

    pressStart();
    dragThrough(1, firstTrailLength - 1);

    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: firstTrailLength, attempts: firstTrailLength });
  });

  it('accepts a press that started outside and entered the start while held', () => {
    const { onRoundComplete } = renderHold();
    dragThrough(0, firstTrailLength - 1);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: firstTrailLength, attempts: firstTrailLength });
  });

  it('sends the trail back to the start with a hint when the button is released midway', () => {
    const { onRoundComplete, onRetry, area } = renderHold();

    pressStart();
    dragThrough(1, 2);
    fireEvent.pointerUp(area, { button: 0, buttons: 0 });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(RELEASE_HINT);
    expect(RELEASE_HINT).toContain('Giữ chặt nút chuột nhé');
    expect(checkpoint(0)).toHaveClass('is-next');
    expect(checkpoint(1)).not.toHaveClass('is-done');

    pressStart();
    dragThrough(1, firstTrailLength - 1);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: firstTrailLength, attempts: firstTrailLength + 1 });
  });

  it('also resets when the button is released outside the trail area', () => {
    const { onRoundComplete, onRetry } = renderHold();

    pressStart();
    dragThrough(1, 2);
    fireEvent.pointerUp(window, { button: 0, buttons: 0 });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(RELEASE_HINT);
    expect(checkpoint(0)).toHaveClass('is-next');

    fireEvent.pointerUp(window, { button: 0, buttons: 0 });
    expect(onRetry).toHaveBeenCalledTimes(1);

    pressStart();
    dragThrough(1, firstTrailLength - 1);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: firstTrailLength, attempts: firstTrailLength + 1 });
  });

  it('stops listening for a release once the round unmounts', () => {
    const onRetry = vi.fn();
    const { unmount } = render(<HoldTrailGame roundIndex={0} totalRounds={6} onRoundComplete={vi.fn()} onRetry={onRetry} speak={vi.fn()} />);
    pressStart();
    unmount();
    fireEvent.pointerUp(window, { button: 0, buttons: 0 });
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('resets when the cursor reaches the next point with the button already up', () => {
    const { onRoundComplete, onRetry } = renderHold();

    pressStart();
    dragThrough(1, 1);
    fireEvent.pointerEnter(checkpoint(2), { buttons: 0 });

    expect(onRetry).toHaveBeenCalledWith(RELEASE_HINT);
    expect(checkpoint(0)).toHaveClass('is-next');
    expect(onRoundComplete).not.toHaveBeenCalled();
  });

  it('ignores a free cursor crossing the trail before the start is pressed', () => {
    const { onRetry, area } = renderHold();

    for (let index = 0; index < firstTrailLength; index += 1) fireEvent.pointerEnter(checkpoint(index), { buttons: 0 });
    fireEvent.pointerUp(area, { button: 0, buttons: 0 });

    expect(onRetry).not.toHaveBeenCalled();
    expect(checkpoint(0)).toHaveClass('is-next');
  });
});

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
