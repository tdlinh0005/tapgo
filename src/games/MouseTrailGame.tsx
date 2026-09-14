import { useState } from 'react';
import type { MiniGameProps } from '../game/types';

const TRAILS = [
  [[12, 50], [30, 32], [48, 48], [66, 28], [84, 48]],
  [[12, 24], [28, 42], [46, 26], [64, 50], [84, 30]],
  [[14, 70], [30, 48], [48, 66], [66, 42], [84, 62]],
  [[12, 40], [30, 62], [48, 36], [66, 58], [84, 36]],
  [[14, 30], [30, 30], [48, 50], [66, 70], [84, 70]],
  [[12, 66], [30, 66], [48, 44], [66, 22], [84, 22]],
] as const;

export default function MouseTrailGame({ roundIndex, onRoundComplete }: MiniGameProps) {
  const trail = TRAILS[roundIndex % TRAILS.length];
  const [nextCheckpoint, setNextCheckpoint] = useState(0);

  const visit = (index: number) => {
    if (index !== nextCheckpoint) return;
    const next = nextCheckpoint + 1;
    if (next >= trail.length) {
      onRoundComplete({ correct: trail.length, attempts: trail.length });
    } else {
      setNextCheckpoint(next);
    }
  };

  return (
    <section className="trail-area" aria-label="Đường rê chuột">
      <div className="trail-guide" aria-hidden="true" />
      {trail.map(([left, top], index) => (
        <div
          key={index}
          data-testid={`checkpoint-${index}`}
          className={`trail-checkpoint${index < nextCheckpoint ? ' is-done' : ''}${index === nextCheckpoint ? ' is-next' : ''}`}
          style={{ left: `${left}%`, top: `${top}%` }}
          onPointerEnter={() => visit(index)}
          aria-label={index === trail.length - 1 ? 'Đích' : `Điểm ${index + 1}`}
        >
          {index === trail.length - 1 ? '🏁' : index + 1}
        </div>
      ))}
    </section>
  );
}
