import { useState, type MouseEvent } from 'react';
import type { MiniGameProps } from '../game/types';

const POSITIONS = [
  [15, 20], [70, 18], [42, 32], [20, 58], [74, 56], [48, 72],
  [28, 38], [62, 40], [14, 72], [80, 70], [50, 18], [36, 62],
] as const;

export default function ClickTargetGame({ roundIndex, onRoundComplete, onRetry, assistLevel = 0 }: MiniGameProps) {
  const [attempts, setAttempts] = useState(0);
  const [left, top] = POSITIONS[roundIndex % POSITIONS.length];

  const handleMiss = () => {
    setAttempts((current) => current + 1);
    onRetry?.();
  };

  const handleTarget = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRoundComplete({ correct: 1, attempts: attempts + 1 });
  };

  return (
    <section
      className="click-play-area"
      data-testid="play-area"
      onClick={handleMiss}
      aria-label="Khu vực luyện click"
    >
      <button
        type="button"
        className={`click-target${assistLevel > 0 ? ' is-assisted' : ''}`}
        aria-label="Mục tiêu"
        onClick={handleTarget}
        style={{ left: `${left}%`, top: `${top}%` }}
      >
        <span className="click-target-visual" aria-hidden="true">⭐</span>
      </button>
    </section>
  );
}
