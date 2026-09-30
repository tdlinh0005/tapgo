import { useState, type MouseEvent } from 'react';
import type { MiniGameProps } from '../game/types';

export const SAFE_AREA = { left: [14, 80], top: [18, 72] } as const;

const randomBetween = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

export default function ClickTargetGame({ onRoundComplete, onRetry, assistLevel = 0 }: MiniGameProps) {
  const [attempts, setAttempts] = useState(0);
  const [{ left, top }] = useState(() => ({ left: randomBetween(SAFE_AREA.left), top: randomBetween(SAFE_AREA.top) }));

  const handleMiss = () => {
    setAttempts((current) => current + 1);
    onRetry?.();
  };

  const handleTarget = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRoundComplete({ correct: 1, attempts: attempts + 1 });
  };

  return (
    <>
      <p className="game-prompt">Click vào ngôi sao</p>
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
    </>
  );
}
