import { useRef, useState, type ComponentType, type MouseEvent } from 'react';
import ListenButton from '../components/ListenButton';
import { roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { MultiClickSet } from './mouseDrills';
import { joinNames, targetSlots } from './mouseLayout';

export function createMultiClickGame({ title, items, targetCounts, size, ordered }: MultiClickSet): ComponentType<MiniGameProps> {
  return function MultiClickGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const count = targetCounts[roundIndex % targetCounts.length];
    const seed = roundSeed(roundIndex, sessionSeed);
    const pictures = shuffleWithSeed(items, seed).slice(0, count);
    const slots = targetSlots(count, seed + 1);
    const [done, setDone] = useState<readonly number[]>([]);
    const misses = useRef(0);
    const nextIndex = ordered ? done.length : pictures.findIndex((_, index) => !done.includes(index));
    const prompt = ordered ? `Click theo số từ 1 đến ${count}` : 'Click hết các hình';
    const listenText = ordered ? `Click các hình theo số, từ số 1 đến số ${count}` : `Click vào từng hình: ${joinNames(pictures.map(({ name }) => name))}`;

    const miss = (hint?: string) => {
      misses.current += 1;
      onRetry?.(hint);
    };

    const handleTarget = (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (done.includes(index)) return;
      if (ordered && index !== nextIndex) {
        miss(`${RETRY_PREFIX} Click số ${nextIndex + 1} trước nhé.`);
        return;
      }
      const nextDone = [...done, index];
      if (nextDone.length === count) {
        onRoundComplete({ correct: count, attempts: count + misses.current });
      } else {
        setDone(nextDone);
      }
    };

    return (
      <>
        <p className="game-prompt">{prompt}</p>
        <ListenButton text={listenText} speak={speak} />
        <section className="click-play-area" data-testid="play-area" onClick={() => miss()} aria-label={title}>
          {pictures.map((picture, index) => (
            <button
              key={picture.emoji}
              type="button"
              className="multi-click-target"
              data-size={size}
              data-state={done.includes(index) ? 'done' : undefined}
              data-assist={index === nextIndex ? assistLevel || undefined : undefined}
              aria-label={ordered ? `Số ${index + 1}` : picture.name}
              onClick={handleTarget(index)}
              style={{ left: `${slots[index].left}%`, top: `${slots[index].top}%` }}
            >
              <span aria-hidden="true">{picture.emoji}</span>
              {ordered && <span className="multi-click-number" aria-hidden="true">{index + 1}</span>}
            </button>
          ))}
        </section>
      </>
    );
  };
}
