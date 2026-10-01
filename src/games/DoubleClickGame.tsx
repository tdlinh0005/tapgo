import { useEffect, useRef, type ComponentType, type MouseEvent } from 'react';
import ListenButton from '../components/ListenButton';
import { pickRound, roundSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { DoubleClickSet } from './mouseDrills';
import { targetSlots } from './mouseLayout';

/** Matches the common OS double-click interval; a lone click is judged only after it passes. */
export const DOUBLE_CLICK_WINDOW_MS = 500;

export const SINGLE_CLICK_HINT = `${RETRY_PREFIX} Bấm nhanh hai lần nhé.`;

export function createDoubleClickGame({ title, items }: DoubleClickSet): ComponentType<MiniGameProps> {
  return function DoubleClickGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const item = pickRound(items, roundIndex, sessionSeed);
    const [slot] = targetSlots(1, roundSeed(roundIndex, sessionSeed));
    const prompt = `Nháy đúp để mở ${item.name}`;
    const misses = useRef(0);
    const pendingSingle = useRef<ReturnType<typeof setTimeout>>(undefined);
    const latestOnRetry = useRef(onRetry);
    latestOnRetry.current = onRetry;

    useEffect(() => () => clearTimeout(pendingSingle.current), []);

    const miss = (hint?: string) => {
      misses.current += 1;
      latestOnRetry.current?.(hint);
    };

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (event.detail > 1) return;
      clearTimeout(pendingSingle.current);
      pendingSingle.current = setTimeout(() => miss(SINGLE_CLICK_HINT), DOUBLE_CLICK_WINDOW_MS);
    };

    const handleDoubleClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      clearTimeout(pendingSingle.current);
      onRoundComplete({ correct: 1, attempts: 1 + misses.current });
    };

    return (
      <>
        <p className="game-prompt">{prompt}</p>
        <ListenButton text={`Nháy đúp chuột, bấm thật nhanh hai lần vào ${item.name} để mở ra`} speak={speak} />
        <section className="click-play-area" data-testid="play-area" onClick={() => miss()} aria-label={title}>
          <button
            type="button"
            className="multi-click-target"
            data-size="medium"
            data-assist={assistLevel || undefined}
            aria-label={item.name}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            style={{ left: `${slot.left}%`, top: `${slot.top}%` }}
          >
            <span aria-hidden="true">{item.emoji}</span>
          </button>
        </section>
      </>
    );
  };
}
