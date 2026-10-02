import { useRef, useState, type ComponentType } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { MoleSet } from './funGames';

export const MOLE_HOLES = 6;
const MOLE = artUrl('play/mole');
const HOLE = artUrl('play/mole-hole');

/** Mole n sits in hole `order[n]`; the friend only uses holes no mole ever visits, so it never sits on a star. */
export function moleLayout(count: number, seed: number) {
  const order = shuffleWithSeed(Array.from({ length: MOLE_HOLES }, (_, hole) => hole), seed);
  const free = order.slice(count);
  return { moles: order.slice(0, count), friendAt: (caught: number) => free[caught % free.length] };
}

export function createMoleGame({ title, scene, counts, friendFrom, friend }: MoleSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function MoleGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const count = counts[roundIndex % counts.length];
    const { moles, friendAt } = moleLayout(count, roundSeed(roundIndex, sessionSeed));
    const [caught, setCaught] = useState(0);
    const misses = useRef(0);
    const moleHole = moles[caught];
    const friendHole = roundIndex % counts.length >= friendFrom ? friendAt(caught) : -1;

    const miss = (hint: string) => {
      misses.current += 1;
      onRetry?.(`${RETRY_PREFIX} ${hint}`);
    };

    const clickHole = (hole: number) => {
      if (hole === moleHole) {
        if (caught + 1 === count) {
          onRoundComplete({ correct: count, attempts: count + misses.current });
          return;
        }
        setCaught(caught + 1);
        return;
      }
      if (moles.slice(0, caught).includes(hole)) return;
      miss(hole === friendHole ? `Đó là ${friend.name}. Click bạn chuột chũi nhé.` : 'Click bạn chuột chũi đang ló đầu nhé.');
    };

    return (
      <>
        <p className="game-prompt">Click bạn chuột chũi · {caught} / {count} <Emoji char="⭐" /></p>
        <ListenButton text={`Click bạn chuột chũi đang ló đầu. Tìm ${count} lần nhé`} speak={speak} />
        <section className="click-play-area mole-garden" data-testid="play-area" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          {Array.from({ length: MOLE_HOLES }, (_, hole) => {
            const isMole = hole === moleHole;
            const isFriend = hole === friendHole;
            const isDone = moles.slice(0, caught).includes(hole);
            const label = isMole ? 'Bạn chuột chũi' : isFriend ? friend.name : isDone ? 'Hang đã có sao' : `Hang trống ${hole + 1}`;
            return (
              <button
                key={hole}
                type="button"
                className="mole-hole"
                data-kind={isMole ? 'mole' : isFriend ? 'friend' : undefined}
                data-state={isDone ? 'done' : undefined}
                data-assist={isMole ? assistLevel || undefined : undefined}
                aria-label={label}
                style={HOLE ? { backgroundImage: `url(${HOLE})` } : undefined}
                onClick={() => clickHole(hole)}
              >
                {isMole && <span key={caught} className="mole-peek" aria-hidden="true"><img src={MOLE} alt="" draggable={false} /></span>}
                {isFriend && <span key={`f${caught}`} className="mole-peek" aria-hidden="true"><Emoji char={friend.emoji} /></span>}
                {isDone && <span className="mole-star" aria-hidden="true"><Emoji char="⭐" /></span>}
              </button>
            );
          })}
        </section>
      </>
    );
  };
}
