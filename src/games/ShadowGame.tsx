import { useRef, useState, type ComponentType } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { resolveDrop, usePointerDrag } from '../hooks/usePointerDrag';
import type { NamedPicture } from './mouseDrills';
import type { ShadowSet } from './funGames';
import { joinNames } from './mouseLayout';

const SLOT_SELECTOR = '[data-shadow-slot]';

type PieceProps = { item: NamedPicture; id: number; onDrop: (clientX: number, clientY: number) => void };

function ShadowPiece({ item, id, onDrop }: PieceProps) {
  const drag = usePointerDrag(onDrop);
  return (
    <button
      type="button"
      className={`drag-item multi-drag-item${drag.isDragging ? ' is-dragging' : ''}`}
      aria-label={item.name}
      data-shadow-piece={id}
      style={{ transform: `translate(${drag.translation.x}px, ${drag.translation.y}px)` }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onLostPointerCapture={drag.onLostPointerCapture}
    >
      <Emoji char={item.emoji} />
    </button>
  );
}

export function createShadowGame({ title, scene, items, counts }: ShadowSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function ShadowGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const count = counts[roundIndex % counts.length];
    const seed = roundSeed(roundIndex, sessionSeed);
    const tray = shuffleWithSeed(items, seed).slice(0, count);
    const shadows = shuffleWithSeed(tray, seed + 1);
    const [placed, setPlaced] = useState<readonly string[]>([]);
    const attempts = useRef(0);
    const next = tray.find((item) => !placed.includes(item.emoji));

    const dropItem = (item: NamedPicture) => (clientX: number, clientY: number) => {
      attempts.current += 1;
      const slot = document.querySelector<HTMLElement>(`[data-shadow-slot="${tray.indexOf(item)}"]`);
      if (!resolveDrop(clientX, clientY, SLOT_SELECTOR, slot, assistLevel)) {
        onRetry?.(`${RETRY_PREFIX} Nhìn hình dáng của ${item.name} để tìm đúng cái bóng nhé.`);
        return;
      }
      const nextPlaced = [...placed, item.emoji];
      if (nextPlaced.length === tray.length) {
        onRoundComplete({ correct: tray.length, attempts: attempts.current });
      } else {
        setPlaced(nextPlaced);
      }
    };

    return (
      <section className="drag-game shadow-game" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
        <p className="game-prompt">Kéo bạn thú vào đúng cái bóng</p>
        <ListenButton text={`Kéo ${joinNames(tray.map((item) => item.name))} vào đúng cái bóng của mình`} speak={speak} />
        <div className="shadow-tray">
          {tray.map((item) =>
            placed.includes(item.emoji)
              ? <span key={item.emoji} className="multi-drag-slot" aria-hidden="true" />
              : <ShadowPiece key={item.emoji} item={item} id={tray.indexOf(item)} onDrop={dropItem(item)} />,
          )}
        </div>
        <div className="shadow-slots">
          {shadows.map((item) => {
            const isPlaced = placed.includes(item.emoji);
            return (
              <div
                key={item.emoji}
                className="shadow-slot"
                data-shadow-slot={tray.indexOf(item)}
                data-state={isPlaced ? 'placed' : undefined}
                data-assist={item === next ? assistLevel || undefined : undefined}
                role="img"
                aria-label={isPlaced ? `${item.name} đã về đúng bóng` : `Cái bóng ${shadows.indexOf(item) + 1}`}
              >
                <span className="shadow-figure" aria-hidden="true"><Emoji char={item.emoji} /></span>
              </div>
            );
          })}
        </div>
      </section>
    );
  };
}
