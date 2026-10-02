import { useRef, useState, type ComponentType } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound, roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { CloseSet } from './funGames';

/** Side-by-side windows take one quarter each; overlapping ones cascade so every ✕ stays in sight. */
const QUARTERS = [[4, 6], [52, 6], [4, 52], [52, 52]] as const;
export const WINDOW_TREATS = ['🎈', '🎁', '⭐', '🍦'] as const;

export type WindowSpot = { left: number; top: number };

export function windowLayout(count: number, overlap: boolean, seed: number): WindowSpot[] {
  if (overlap) return Array.from({ length: count }, (_, index) => ({ left: 12 + index * 9, top: 6 + index * 9 }));
  return shuffleWithSeed(QUARTERS, seed).slice(0, count).map(([left, top]) => ({ left, top }));
}

export function createCloseWindowGame({ title, pictures, windowCounts, sizes, overlaps }: CloseSet): ComponentType<MiniGameProps> {
  return function CloseWindowGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const round = roundIndex % windowCounts.length;
    const count = windowCounts[round];
    const overlap = overlaps[round];
    const picture = pickRound(pictures, roundIndex, sessionSeed);
    const url = artUrl(picture.art);
    const spots = windowLayout(count, overlap, roundSeed(roundIndex, sessionSeed));
    const [closed, setClosed] = useState<readonly number[]>([]);
    const misses = useRef(0);
    const open = spots.map((_, index) => index).filter((index) => !closed.includes(index));
    const top = open[open.length - 1];

    const miss = (hint: string) => {
      misses.current += 1;
      onRetry?.(`${RETRY_PREFIX} ${hint}`);
    };

    const close = (index: number) => {
      if (overlap && index !== top) {
        miss('Cửa sổ này đang bị che. Đóng cửa sổ ở trên cùng trước nhé.');
        return;
      }
      if (open.length === 1) {
        onRoundComplete({ correct: count, attempts: count + misses.current });
        return;
      }
      setClosed([...closed, index]);
    };

    const listen = `Click vào dấu nhân ở góc trên bên phải mỗi cửa sổ để đóng lại${overlap ? '. Đóng cửa sổ ở trên cùng trước nhé' : ''}`;

    return (
      <>
        <p className="game-prompt">Đóng {count} cửa sổ để xem tranh</p>
        <ListenButton text={listen} speak={speak} />
        <section className="click-play-area close-desk" data-testid="play-area" data-scene={picture.art} aria-label={`${title}: tranh ${picture.name}`} style={url ? { backgroundImage: `url(${url})` } : undefined}>
          {open.map((index) => (
            <div
              key={index}
              className="popup-window"
              data-size={sizes[round]}
              role="group"
              aria-label={`Cửa sổ ${index + 1}`}
              style={{ left: `${spots[index].left}%`, top: `${spots[index].top}%` }}
              onClick={() => miss('Click vào dấu ✕ ở góc trên bên phải để đóng nhé.')}
            >
              <div className="popup-bar">
                <span className="popup-title">Cửa sổ {index + 1}</span>
                <button
                  type="button"
                  className="popup-close"
                  data-assist={index === top ? assistLevel || undefined : undefined}
                  aria-label={`Đóng cửa sổ ${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    close(index);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="popup-body" aria-hidden="true"><Emoji char={WINDOW_TREATS[index % WINDOW_TREATS.length]} /></div>
            </div>
          ))}
        </section>
      </>
    );
  };
}
