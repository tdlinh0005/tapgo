import { useRef } from 'react';
import type { MiniGameProps } from '../game/types';
import { usePointerDrag } from '../hooks/usePointerDrag';

const ROUNDS = [
  { item: '🍎', target: '🧺', label: 'Kéo quả táo vào giỏ', decoy: '📦' },
  { item: '🍌', target: '🧺', label: 'Kéo quả chuối vào giỏ', decoy: '🎒' },
  { item: '🚗', target: '🅿️', label: 'Kéo ô tô vào chỗ đỗ', decoy: '🏠' },
  { item: '🚲', target: '🅿️', label: 'Kéo xe đạp vào chỗ đỗ', decoy: '🌳' },
  { item: '🐱', target: '🏠', label: 'Kéo mèo về nhà', decoy: '🧺' },
  { item: '🐶', target: '🏠', label: 'Kéo chó về nhà', decoy: '🌌' },
  { item: '🚀', target: '🌌', label: 'Kéo tên lửa lên trời', decoy: '🅿️' },
  { item: '⭐', target: '🌌', label: 'Kéo ngôi sao lên trời', decoy: '🏠' },
] as const;

export default function DragSortGame({ roundIndex, onRoundComplete }: MiniGameProps) {
  const round = ROUNDS[roundIndex % ROUNDS.length];
  const attempts = useRef(0);

  const handleDrop = (clientX: number, clientY: number) => {
    attempts.current += 1;
    const element = document.elementFromPoint?.(clientX, clientY);
    const zone = element?.closest<HTMLElement>('[data-drop-result]');
    if (zone?.dataset.dropResult === 'correct') {
      onRoundComplete({ correct: 1, attempts: attempts.current });
    }
  };

  const drag = usePointerDrag(handleDrop);

  return (
    <section className="drag-game">
      <p className="game-prompt">{round.label}</p>
      <div className="drag-stage">
        <button
          type="button"
          className="drag-item"
          data-testid="drag-item"
          aria-label={round.item}
          style={{ transform: `translate(${drag.translation.x}px, ${drag.translation.y}px)` }}
          onPointerDown={drag.onPointerDown}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
          onPointerCancel={drag.onPointerCancel}
        >
          {round.item}
        </button>
        <div className="drop-zone" data-drop-result="correct" data-testid="correct-zone">
          <span aria-hidden="true">{round.target}</span>
          <span>Đúng nơi</span>
        </div>
        <div className="drop-zone" data-drop-result="wrong" data-testid="wrong-zone">
          <span aria-hidden="true">{round.decoy}</span>
          <span>Nơi khác</span>
        </div>
      </div>
    </section>
  );
}
