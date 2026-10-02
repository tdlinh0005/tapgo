import { useRef, useState, type ComponentType } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { pickRound, roundSeed, shuffleWithSeed } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';
import { resolveDrop, usePointerDrag } from '../hooks/usePointerDrag';
import type { MultiDragSet, NamedPicture, SortGroup } from './mouseDrills';
import { joinNames } from './mouseLayout';

type DragPiece = NamedPicture & { groupId: string };

const ZONE_SELECTOR = '[data-sort-zone]';

export function dragRoundPieces(groups: readonly SortGroup[], itemCount: number, seed: number): DragPiece[] {
  const perGroup = itemCount / groups.length;
  const pieces = groups.flatMap((group, index) => shuffleWithSeed(group.items, seed + index).slice(0, perGroup).map((item) => ({ ...item, groupId: group.id })));
  return shuffleWithSeed(pieces, seed);
}

type DraggablePieceProps = { piece: DragPiece; onDrop: (clientX: number, clientY: number) => void };

function DraggablePiece({ piece, onDrop }: DraggablePieceProps) {
  const drag = usePointerDrag(onDrop);
  return (
    <button
      type="button"
      className={`drag-item multi-drag-item${drag.isDragging ? ' is-dragging' : ''}`}
      aria-label={piece.name}
      style={{ transform: `translate(${drag.translation.x}px, ${drag.translation.y}px)` }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onLostPointerCapture={drag.onLostPointerCapture}
    >
      <Emoji char={piece.emoji} />
    </button>
  );
}

export function createMultiDragGame({ title, items, itemCount }: MultiDragSet): ComponentType<MiniGameProps> {
  return function MultiDragGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const seed = roundSeed(roundIndex, sessionSeed);
    const groups = shuffleWithSeed(pickRound(items, roundIndex, sessionSeed), seed);
    const pieces = dragRoundPieces(groups, itemCount, seed);
    const [placed, setPlaced] = useState<readonly string[]>([]);
    const attempts = useRef(0);
    const nextPiece = pieces.find(({ name }) => !placed.includes(name));
    const prompt = groups.length === 1 ? `Kéo hết vào ${groups[0].label.toLowerCase()}` : 'Kéo mỗi món vào đúng chỗ';
    const listenText = `Kéo ${joinNames(groups.map(({ kind, label }) => `${kind} vào ${label.toLowerCase()}`))}`;

    const dropPiece = (piece: DragPiece) => (clientX: number, clientY: number) => {
      attempts.current += 1;
      const correctZone = document.querySelector<HTMLElement>(`[data-sort-zone="${piece.groupId}"]`);
      if (!resolveDrop(clientX, clientY, ZONE_SELECTOR, correctZone, assistLevel)) {
        onRetry?.();
        return;
      }
      const nextPlaced = [...placed, piece.name];
      if (nextPlaced.length === pieces.length) {
        onRoundComplete({ correct: pieces.length, attempts: attempts.current });
      } else {
        setPlaced(nextPlaced);
      }
    };

    return (
      <section className="drag-game" aria-label={title}>
        <p className="game-prompt">{prompt}</p>
        <ListenButton text={listenText} speak={speak} />
        <div className="multi-drag-items">
          {pieces.map((piece) =>
            placed.includes(piece.name)
              ? <span key={piece.name} className="multi-drag-slot" aria-hidden="true" />
              : <DraggablePiece key={piece.name} piece={piece} onDrop={dropPiece(piece)} />,
          )}
        </div>
        <div className="multi-drag-zones">
          {groups.map((group) => (
            <div
              key={group.id}
              className="drop-zone"
              data-sort-zone={group.id}
              data-testid={`zone-${group.id}`}
              data-assist={group.id === nextPiece?.groupId ? assistLevel || undefined : undefined}
            >
              <span aria-hidden="true"><Emoji char={group.place} /></span>
              <span>{group.label}</span>
              <span className="multi-drag-placed" aria-label={`Đã kéo vào ${group.label.toLowerCase()}`}>
                {pieces.filter((piece) => piece.groupId === group.id && placed.includes(piece.name)).map(({ name, emoji }) => <Emoji key={name} char={emoji} />)}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };
}
