import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { PopKeysSet } from './funGames';
import { joinNames, targetSlots } from './mouseLayout';

const HUES_DEG = [0, 200, 280, 35];

export function createPopKeysGame({ title, scene, keys, counts, pictures, thing, keyWord, done, prompt }: PopKeysSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function PopKeysGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const count = counts[roundIndex % counts.length];
    const seed = roundSeed(roundIndex, sessionSeed);
    const shown = shuffleWithSeed(keys, seed).slice(0, count);
    const slots = targetSlots(count, seed + 1);
    const [popped, setPopped] = useState<readonly string[]>([]);
    const misses = useRef(0);
    const nextKey = shown.find((key) => !popped.includes(key));

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
        if (event.key === ' ') {
          event.preventDefault();
          return;
        }
        const key = event.key.toUpperCase();
        if (popped.includes(key)) return;
        if (!shown.includes(key)) {
          misses.current += 1;
          onRetry?.(`${RETRY_PREFIX} Bấm một ${keyWord} có trên ${thing.toLowerCase()} nhé.`);
          return;
        }
        const nextPopped = [...popped, key];
        if (nextPopped.length === count) {
          onRoundComplete({ correct: count, attempts: count + misses.current });
        } else {
          setPopped(nextPopped);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [popped, shown, count, onRoundComplete, onRetry]);

    return (
      <>
        <p className="game-prompt">{prompt}</p>
        <ListenButton text={`Bấm các ${keyWord}: ${joinNames([...shown])}`} speak={speak} />
        <section className="click-play-area pop-area" data-testid="play-area" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          {shown.map((key, index) => {
            const isPopped = popped.includes(key);
            const style = { left: `${slots[index].left}%`, top: `${slots[index].top}%`, '--pop-hue': `${HUES_DEG[index % HUES_DEG.length]}deg`, '--pop-delay': `${index * -0.7}s` } as CSSProperties;
            return (
              <div
                key={key}
                className="pop-target"
                data-state={isPopped ? 'popped' : undefined}
                data-assist={key === nextKey ? assistLevel || undefined : undefined}
                role="img"
                aria-label={isPopped ? `${thing} ${keyWord} ${key} đã xong` : `${thing} ${keyWord} ${key}`}
                style={style}
              >
                <span className="pop-picture" aria-hidden="true"><Emoji char={isPopped ? done : pictures[index % pictures.length]} /></span>
                {!isPopped && <span className="pop-key" aria-hidden="true">{key}</span>}
              </div>
            );
          })}
        </section>
      </>
    );
  };
}
