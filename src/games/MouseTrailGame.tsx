import { useRef, useState } from 'react';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';

export const TRAILS = [
  [[10, 50], [24, 32], [38, 48], [52, 30], [66, 48], [80, 32], [92, 50]],
  [[10, 26], [26, 44], [42, 28], [58, 50], [74, 32], [90, 52]],
  [[10, 68], [22, 50], [34, 66], [46, 46], [58, 64], [70, 44], [82, 62], [92, 44]],
  [[10, 40], [26, 62], [42, 38], [58, 60], [74, 36], [90, 58]],
  [[10, 30], [24, 30], [38, 48], [52, 66], [66, 66], [80, 48], [92, 30]],
  [[10, 66], [26, 66], [42, 46], [58, 26], [74, 26], [90, 46]],
] as const;

export default function MouseTrailGame({ roundIndex, onRoundComplete, onRetry, assistLevel = 0 }: MiniGameProps) {
  const trail = TRAILS[roundIndex % TRAILS.length];
  const finishIndex = trail.length - 1;
  const [nextCheckpoint, setNextCheckpoint] = useState(0);
  const wrongEntries = useRef(0);

  const labelFor = (index: number) => {
    if (index === 0) return 'Điểm bắt đầu';
    if (index === finishIndex) return 'Đích';
    return `Điểm ${index}`;
  };

  const visit = (index: number) => {
    if (index < nextCheckpoint) return;
    if (index > nextCheckpoint) {
      wrongEntries.current += 1;
      onRetry?.(`${RETRY_PREFIX} Đưa chuột tới ${labelFor(nextCheckpoint).toLowerCase()} trước nhé.`);
      return;
    }
    const next = nextCheckpoint + 1;
    if (next >= trail.length) {
      onRoundComplete({ correct: trail.length, attempts: trail.length + wrongEntries.current });
    } else {
      setNextCheckpoint(next);
    }
  };

  return (
    <>
      <p className="game-prompt">Đưa chuột qua các điểm tới 🏁</p>
      <section className="trail-area" aria-label="Đường rê chuột">
        <svg className="trail-guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={trail.map(([x, y]) => `${x},${y}`).join(' ')} vectorEffect="non-scaling-stroke" />
        </svg>
        {trail.map(([left, top], index) => (
          <div
            key={index}
            data-testid={`checkpoint-${index}`}
            className={`trail-checkpoint${index < nextCheckpoint ? ' is-done' : ''}${index === nextCheckpoint ? ' is-next' : ''}${assistLevel > 0 && index === nextCheckpoint ? ' is-assisted' : ''}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            onPointerEnter={() => visit(index)}
            role="img"
            aria-label={labelFor(index)}
          >
            <span>{index === 0 ? '🟢' : index === finishIndex ? '🏁' : index}</span>
          </div>
        ))}
      </section>
    </>
  );
}
