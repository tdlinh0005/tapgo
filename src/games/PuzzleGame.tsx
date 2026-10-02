import { useRef, useState, type ComponentType, type CSSProperties } from 'react';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound, roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { resolveDrop, usePointerDrag } from '../hooks/usePointerDrag';
import type { PuzzleSet } from './funGames';

export const PUZZLE_PIECE_NAMES = ['Mảnh góc trên bên trái', 'Mảnh góc trên bên phải', 'Mảnh góc dưới bên trái', 'Mảnh góc dưới bên phải'] as const;
const CELL_SELECTOR = '[data-puzzle-cell]';

/** Shows one quarter of the picture: 2x the picture size, shifted to that quarter. */
const pieceStyle = (url: string | undefined, piece: number): CSSProperties => ({
  backgroundImage: url ? `url(${url})` : undefined,
  backgroundSize: '200% 200%',
  backgroundPosition: `${(piece % 2) * 100}% ${Math.floor(piece / 2) * 100}%`,
});

type PieceProps = { piece: number; url: string | undefined; onDrop: (clientX: number, clientY: number) => void };

function PuzzlePiece({ piece, url, onDrop }: PieceProps) {
  const drag = usePointerDrag(onDrop);
  return (
    <button
      type="button"
      className={`drag-item puzzle-piece${drag.isDragging ? ' is-dragging' : ''}`}
      aria-label={PUZZLE_PIECE_NAMES[piece]}
      data-piece={piece}
      style={{ ...pieceStyle(url, piece), transform: `translate(${drag.translation.x}px, ${drag.translation.y}px)` }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onLostPointerCapture={drag.onLostPointerCapture}
    />
  );
}

export function createPuzzleGame({ title, pictures }: PuzzleSet): ComponentType<MiniGameProps> {
  return function PuzzleGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const picture = pickRound(pictures, roundIndex, sessionSeed);
    const url = artUrl(picture.art);
    const tray = shuffleWithSeed([0, 1, 2, 3], roundSeed(roundIndex, sessionSeed));
    const [placed, setPlaced] = useState<readonly number[]>([]);
    const attempts = useRef(0);
    const nextPiece = tray.find((piece) => !placed.includes(piece));

    const dropPiece = (piece: number) => (clientX: number, clientY: number) => {
      attempts.current += 1;
      const cell = document.querySelector<HTMLElement>(`[data-puzzle-cell="${piece}"]`);
      if (!resolveDrop(clientX, clientY, CELL_SELECTOR, cell, assistLevel)) {
        onRetry?.(`${RETRY_PREFIX} Nhìn hình mờ để tìm chỗ của mảnh này nhé.`);
        return;
      }
      const nextPlaced = [...placed, piece];
      if (nextPlaced.length === tray.length) {
        onRoundComplete({ correct: tray.length, attempts: attempts.current });
      } else {
        setPlaced(nextPlaced);
      }
    };

    return (
      <section className="drag-game puzzle-game" aria-label={title}>
        <p className="game-prompt">Ghép tranh {picture.name}</p>
        <ListenButton text={`Kéo bốn mảnh vào đúng chỗ để ghép tranh ${picture.name}`} speak={speak} />
        <div className="puzzle-stage">
          <div className="puzzle-tray">
            {tray.map((piece) =>
              placed.includes(piece)
                ? <span key={piece} className="puzzle-slot" aria-hidden="true" />
                : <PuzzlePiece key={piece} piece={piece} url={url} onDrop={dropPiece(piece)} />,
            )}
          </div>
          <div className="puzzle-board" role="group" aria-label={`Khung tranh ${picture.name}`}>
            <span className="puzzle-ghost" aria-hidden="true" style={{ backgroundImage: url ? `url(${url})` : undefined }} />
            {[0, 1, 2, 3].map((cell) => (
              <div
                key={cell}
                className="puzzle-cell"
                data-puzzle-cell={cell}
                data-state={placed.includes(cell) ? 'placed' : undefined}
                data-assist={cell === nextPiece ? assistLevel || undefined : undefined}
                aria-label={placed.includes(cell) ? `${PUZZLE_PIECE_NAMES[cell]} đã ghép` : `Chỗ trống ${cell + 1}`}
                style={placed.includes(cell) ? pieceStyle(url, cell) : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };
}
