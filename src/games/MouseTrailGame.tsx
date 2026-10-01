import { useEffect, useRef, useState, type ComponentType, type PointerEvent } from 'react';
import ListenButton from '../components/ListenButton';
import { RETRY_PREFIX } from '../game/retryCopy';
import { pickRound } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';
import type { TargetSize, Trail } from './mouseDrills';

export const TRAILS = [
  [[10, 50], [24, 32], [38, 48], [52, 30], [66, 48], [80, 32], [92, 50]],
  [[10, 26], [26, 44], [42, 28], [58, 50], [74, 32], [90, 52]],
  [[10, 68], [22, 50], [34, 66], [46, 46], [58, 64], [70, 44], [82, 62], [92, 44]],
  [[10, 40], [26, 62], [42, 38], [58, 60], [74, 36], [90, 58]],
  [[10, 30], [24, 30], [38, 48], [52, 66], [66, 66], [80, 48], [92, 30]],
  [[10, 66], [26, 66], [42, 46], [58, 26], [74, 26], [90, 46]],
  [[10, 26], [22, 58], [36, 76], [50, 76], [64, 76], [78, 58], [90, 26]],
  [[10, 76], [24, 76], [34, 50], [48, 50], [58, 24], [74, 24], [90, 24]],
  [[12, 24], [12, 76], [36, 76], [36, 24], [60, 24], [60, 76], [86, 76]],
  [[10, 76], [22, 44], [36, 26], [50, 26], [64, 26], [78, 44], [90, 76]],
  [[10, 24], [26, 24], [36, 50], [50, 50], [60, 76], [76, 76], [90, 76]],
  [[14, 76], [14, 24], [38, 24], [38, 76], [62, 76], [62, 24], [88, 24]],
] as const;

export const TRAIL_THEMES = [
  { start: '🐭', finish: '🧀', mover: 'chú chuột', goal: 'miếng phô mai' },
  { start: '🚀', finish: '🌙', mover: 'tên lửa', goal: 'mặt trăng' },
  { start: '🚗', finish: '🏠', mover: 'ô tô', goal: 'ngôi nhà' },
  { start: '🐝', finish: '🌸', mover: 'chú ong', goal: 'bông hoa' },
  { start: '🐶', finish: '🦴', mover: 'chú chó', goal: 'khúc xương' },
  { start: '🐰', finish: '🥕', mover: 'bạn thỏ', goal: 'củ cà rốt' },
  { start: '🐌', finish: '🍃', mover: 'bạn ốc sên', goal: 'chiếc lá' },
] as const;

export const RELEASE_HINT = `${RETRY_PREFIX} Giữ chặt nút chuột nhé.`;

type TrailGameConfig = { trails: readonly Trail[]; checkpointSize: TargetSize; hold: boolean };

const isPrimaryHeld = (event: PointerEvent) => (event.buttons & 1) === 1;

export function createMouseTrailGame({ trails, checkpointSize, hold }: TrailGameConfig): ComponentType<MiniGameProps> {
  return function MouseTrailGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const trail = pickRound(trails, roundIndex, sessionSeed);
    const theme = pickRound(TRAIL_THEMES, roundIndex, sessionSeed);
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
      // Before the start is reached the cursor is only on its way in (a resting cursor when the game opens, or the trip back from the previous finish), so crossing other checkpoints is not a mistake.
      if (index > nextCheckpoint && nextCheckpoint === 0) return;
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

    const releaseMidway = () => {
      if (nextCheckpoint === 0) return;
      wrongEntries.current += 1;
      setNextCheckpoint(0);
      onRetry?.(RELEASE_HINT);
    };
    const latestReleaseMidway = useRef(releaseMidway);
    latestReleaseMidway.current = releaseMidway;
    const holding = hold && nextCheckpoint > 0;

    useEffect(() => {
      if (!holding) return;
      const onRelease = () => latestReleaseMidway.current();
      window.addEventListener('pointerup', onRelease);
      return () => window.removeEventListener('pointerup', onRelease);
    }, [holding]);

    const enter = (index: number) => (event: PointerEvent) => {
      if (hold && !isPrimaryHeld(event)) releaseMidway();
      else visit(index);
    };

    const pressStart = (event: PointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      visit(0);
    };

    const listenText = hold
      ? `Giữ chặt nút chuột trái ở điểm bắt đầu, kéo qua các điểm theo thứ tự, giúp ${theme.mover} tới đích là ${theme.goal}`
      : `Đưa chuột qua các điểm theo thứ tự, giúp ${theme.mover} tới đích là ${theme.goal}`;

    return (
      <>
        <p className="game-prompt">{hold ? 'Giữ chuột kéo' : 'Đưa'} {theme.start} tới {theme.finish}</p>
        <ListenButton text={listenText} speak={speak} />
        <section
          className="trail-area"
          aria-label="Đường rê chuột"
          data-size={checkpointSize}
          data-hold={hold || undefined}
        >
          <svg className="trail-guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={trail.map(([x, y]) => `${x},${y}`).join(' ')} vectorEffect="non-scaling-stroke" />
          </svg>
          {trail.map(([left, top], index) => (
            <div
              key={index}
              data-testid={`checkpoint-${index}`}
              className={`trail-checkpoint${index < nextCheckpoint ? ' is-done' : ''}${index === nextCheckpoint ? ' is-next' : ''}`}
              data-assist={index === nextCheckpoint ? assistLevel || undefined : undefined}
              style={{ left: `${left}%`, top: `${top}%` }}
              onPointerEnter={enter(index)}
              onPointerDown={hold && index === 0 ? pressStart : undefined}
              role="img"
              aria-label={labelFor(index)}
            >
              <span>{index === 0 ? theme.start : index === finishIndex ? theme.finish : index}</span>
            </div>
          ))}
        </section>
      </>
    );
  };
}

export default createMouseTrailGame({ trails: TRAILS, checkpointSize: 'medium', hold: false });
