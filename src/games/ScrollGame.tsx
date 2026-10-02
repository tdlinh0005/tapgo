import { useLayoutEffect, useRef, type ComponentType, type MouseEvent } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { pickRound, roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { NamedPicture } from './mouseDrills';
import type { ScrollSet, ScrollStart } from './funGames';

/** One screen of sea; the box shows one layer and the water is `depth + 1` layers tall. */
export const SEA_LAYER_PX = 360;
const SEA_COLUMNS = [20, 50, 80];

export type SeaSpot = { friend: NamedPicture; layer: number; column: number; isTarget: boolean };

/** The friend waits in the far layer; the first decoy shares its layer and the next one sits on the way. */
export function seaLayout(target: NamedPicture, friends: readonly NamedPicture[], depth: number, decoys: number, start: ScrollStart, seed: number): SeaSpot[] {
  const targetLayer = start === 'top' ? depth : 0;
  const wayLayer = start === 'top' ? targetLayer - 1 : targetLayer + 1;
  const others = shuffleWithSeed(friends.filter((friend) => friend.emoji !== target.emoji), seed).slice(0, decoys);
  const columns = shuffleWithSeed(SEA_COLUMNS, seed + 1);
  return [
    { friend: target, layer: targetLayer, column: columns[0], isTarget: true },
    ...others.map((friend, index) => ({ friend, layer: index === 0 ? targetLayer : wayLayer, column: columns[index + 1], isTarget: false })),
  ];
}

export function createScrollGame({ title, friends, depths, decoys, starts }: ScrollSet): ComponentType<MiniGameProps> {
  return function ScrollGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const round = roundIndex % depths.length;
    const depth = depths[round];
    const start = starts[round];
    const target = pickRound(friends, roundIndex, sessionSeed);
    const spots = seaLayout(target, friends, depth, decoys[round], start, roundSeed(roundIndex, sessionSeed));
    const sea = useRef<HTMLDivElement>(null);
    const misses = useRef(0);
    const way = start === 'top' ? 'lặn xuống' : 'bơi lên';

    useLayoutEffect(() => {
      if (start === 'bottom' && sea.current) sea.current.scrollTop = sea.current.scrollHeight;
    }, [start]);

    const miss = (hint: string) => {
      misses.current += 1;
      onRetry?.(`${RETRY_PREFIX} ${hint}`);
    };

    const clickWater = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) miss(`Lăn bánh xe chuột để ${way} tìm ${target.name} nhé.`);
    };

    const clickSpot = (spot: SeaSpot) => {
      if (spot.isTarget) onRoundComplete({ correct: 1, attempts: 1 + misses.current });
      else miss(`Đó là ${spot.friend.name}. Tìm ${target.name} nhé.`);
    };

    return (
      <>
        <p className="game-prompt">Tìm {target.name} <Emoji char={target.emoji} /></p>
        <ListenButton text={`Lăn bánh xe chuột để ${way} tìm ${target.name}, thấy bạn thì click vào nhé`} speak={speak} />
        <div ref={sea} className="click-play-area scroll-sea" data-testid="play-area" data-start={start} role="region" aria-label={title} style={{ height: SEA_LAYER_PX }}>
          <div className="scroll-water" style={{ height: SEA_LAYER_PX * (depth + 1) }} onClick={clickWater}>
            <span className="scroll-cue" aria-hidden="true" style={{ top: start === 'top' ? SEA_LAYER_PX * 0.75 : SEA_LAYER_PX * (depth + 0.25) }}>
              {start === 'top' ? '↓ Lăn xuống ↓' : '↑ Lăn lên ↑'}
            </span>
            {spots.map((spot) => (
              <button
                key={spot.friend.emoji}
                type="button"
                className="sea-friend"
                data-target={spot.isTarget || undefined}
                data-assist={spot.isTarget ? assistLevel || undefined : undefined}
                aria-label={spot.friend.name}
                style={{ left: `${spot.column}%`, top: SEA_LAYER_PX * (spot.layer + 0.5) }}
                onClick={() => clickSpot(spot)}
              >
                <Emoji char={spot.friend.emoji} />
              </button>
            ))}
          </div>
        </div>
      </>
    );
  };
}
