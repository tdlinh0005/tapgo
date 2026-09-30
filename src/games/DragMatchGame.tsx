import { useRef } from 'react';
import ListenButton from '../components/ListenButton';
import type { MiniGameProps } from '../game/types';
import { resolveDrop, usePointerDrag } from '../hooks/usePointerDrag';

const ROUNDS = [
  { source: '🐱', answer: 'Mèo', options: [['🐱', 'Mèo'], ['🐟', 'Cá'], ['🌳', 'Cây']] },
  { source: '🐶', answer: 'Chó', options: [['🦋', 'Bướm'], ['🐶', 'Chó'], ['🚗', 'Ô tô']] },
  { source: '🐰', answer: 'Thỏ', options: [['🍎', 'Táo'], ['⭐', 'Ngôi sao'], ['🐰', 'Thỏ']] },
  { source: '🚗', answer: 'Ô tô', options: [['🚀', 'Tên lửa'], ['🚗', 'Ô tô'], ['🌙', 'Mặt trăng']] },
  { source: '🚲', answer: 'Xe đạp', options: [['🚲', 'Xe đạp'], ['🐘', 'Voi'], ['🍌', 'Chuối']] },
  { source: '🚀', answer: 'Tên lửa', options: [['⭐', 'Ngôi sao'], ['🏠', 'Nhà'], ['🚀', 'Tên lửa']] },
  { source: '🍎', answer: 'Táo', options: [['🍌', 'Chuối'], ['🍎', 'Táo'], ['🚲', 'Xe đạp']] },
  { source: '⚽', answer: 'Bóng', options: [['⚽', 'Bóng'], ['🦒', 'Hươu cao cổ'], ['🚂', 'Tàu hỏa']] },
] as const;

export default function DragMatchGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const round = ROUNDS[roundIndex % ROUNDS.length];
  const attempts = useRef(0);
  const instruction = `Kéo ${round.answer.toLowerCase()} vào đúng cái bóng của nó`;

  const handleDrop = (clientX: number, clientY: number) => {
    attempts.current += 1;
    const correctZone = document.querySelector<HTMLElement>('[data-match-correct="true"]');
    if (resolveDrop(clientX, clientY, '[data-match-label]', correctZone, assistLevel)) {
      onRoundComplete({ correct: 1, attempts: attempts.current });
    } else {
      onRetry?.();
    }
  };

  const drag = usePointerDrag(handleDrop);

  return (
    <section className="drag-game">
      <p className="game-prompt">Kéo hình vào đúng cái bóng</p>
      <ListenButton text={instruction} speak={speak} />
      <div className="drag-stage">
        <button
          type="button"
          className={`drag-item${drag.isDragging ? ' is-dragging' : ''}`}
          data-testid="drag-match-item"
          aria-label={round.answer}
          style={{ transform: `translate(${drag.translation.x}px, ${drag.translation.y}px)` }}
          onPointerDown={drag.onPointerDown}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
          onPointerCancel={drag.onPointerCancel}
          onLostPointerCapture={drag.onLostPointerCapture}
        >
          {round.source}
        </button>
        <div className="match-options">
          {round.options.map(([emoji, label]) => (
            <div
              key={label}
              className="drop-zone match-zone"
              role="img"
              aria-label={`Bóng của ${label.toLowerCase()}`}
              data-match-label={label}
              data-match-correct={label === round.answer ? 'true' : undefined}
              data-assist={label === round.answer ? assistLevel || undefined : undefined}
            >
              <span className="match-shadow" aria-hidden="true">{emoji}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
