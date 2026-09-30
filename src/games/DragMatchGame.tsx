import { useRef } from 'react';
import type { MiniGameProps } from '../game/types';
import { isPointNearElement, usePointerDrag } from '../hooks/usePointerDrag';

const ROUNDS = [
  { source: '🐱', answer: 'Mèo', options: ['Mèo', 'Chó', 'Thỏ'] },
  { source: '🐶', answer: 'Chó', options: ['Mèo', 'Chó', 'Cá'] },
  { source: '🐰', answer: 'Thỏ', options: ['Gấu', 'Thỏ', 'Mèo'] },
  { source: '🚗', answer: 'Ô tô', options: ['Ô tô', 'Tàu', 'Xe đạp'] },
  { source: '🚲', answer: 'Xe đạp', options: ['Xe buýt', 'Ô tô', 'Xe đạp'] },
  { source: '🚀', answer: 'Tên lửa', options: ['Ngôi sao', 'Tên lửa', 'Mặt trăng'] },
  { source: '🍎', answer: 'Táo', options: ['Chuối', 'Táo', 'Nho'] },
  { source: '⚽', answer: 'Bóng', options: ['Bóng', 'Gấu bông', 'Bong bóng'] },
] as const;

export default function DragMatchGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const round = ROUNDS[roundIndex % ROUNDS.length];
  const attempts = useRef(0);
  const instruction = `Kéo hình vào đúng tên: ${round.answer}`;

  const handleDrop = (clientX: number, clientY: number) => {
    attempts.current += 1;
    const element = document.elementFromPoint?.(clientX, clientY);
    const zone = element?.closest<HTMLElement>('[data-match-label]');
    const correctZone = document.querySelector<HTMLElement>('[data-match-correct="true"]');
    const snapPadding = 24 + assistLevel * 16;
    if (
      zone?.dataset.matchLabel === round.answer
      || isPointNearElement(correctZone, clientX, clientY, snapPadding)
    ) {
      onRoundComplete({ correct: 1, attempts: attempts.current });
    } else {
      onRetry?.();
    }
  };

  const drag = usePointerDrag(handleDrop);

  return (
    <section className="drag-game">
      <p className="game-prompt">Kéo hình vào đúng tên</p>
      <button type="button" className="listen-button" onClick={() => speak(instruction)}>
        <span aria-hidden="true">🔊</span> Nghe yêu cầu
      </button>
      <div className="drag-stage">
        <button
          type="button"
          className={`drag-item${drag.isDragging ? ' is-dragging' : ''}`}
          data-testid="drag-match-item"
          aria-label={round.source}
          style={{ transform: `translate(${drag.translation.x}px, ${drag.translation.y}px)` }}
          onPointerDown={drag.onPointerDown}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
          onPointerCancel={drag.onPointerCancel}
        >
          {round.source}
        </button>
        <div className="match-options">
          {round.options.map((option) => (
            <div
              key={option}
              className="drop-zone match-zone"
              data-match-label={option}
              data-match-correct={option === round.answer ? 'true' : undefined}
              data-testid={`match-${option}`}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
