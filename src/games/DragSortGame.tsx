import ListenButton from '../components/ListenButton';
import type { MiniGameProps } from '../game/types';
import { useDragRound } from '../hooks/usePointerDrag';

const ROUNDS = [
  { item: '🍎', target: '🧺', targetLabel: 'Giỏ', label: 'Kéo quả táo vào giỏ', decoy: '📦', decoyLabel: 'Hộp' },
  { item: '🍌', target: '🧺', targetLabel: 'Giỏ', label: 'Kéo quả chuối vào giỏ', decoy: '🎒', decoyLabel: 'Ba lô' },
  { item: '🚗', target: '🅿️', targetLabel: 'Chỗ đỗ', label: 'Kéo ô tô vào chỗ đỗ', decoy: '🏠', decoyLabel: 'Nhà' },
  { item: '🚲', target: '🅿️', targetLabel: 'Chỗ đỗ', label: 'Kéo xe đạp vào chỗ đỗ', decoy: '🌳', decoyLabel: 'Cây' },
  { item: '🐱', target: '🏠', targetLabel: 'Nhà', label: 'Kéo mèo về nhà', decoy: '🧺', decoyLabel: 'Giỏ' },
  { item: '🐶', target: '🏠', targetLabel: 'Nhà', label: 'Kéo chó về nhà', decoy: '🌌', decoyLabel: 'Bầu trời' },
  { item: '🚀', target: '🌌', targetLabel: 'Bầu trời', label: 'Kéo tên lửa lên trời', decoy: '🅿️', decoyLabel: 'Chỗ đỗ' },
  { item: '⭐', target: '🌌', targetLabel: 'Bầu trời', label: 'Kéo ngôi sao lên trời', decoy: '🏠', decoyLabel: 'Nhà' },
] as const;

export default function DragSortGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const round = ROUNDS[roundIndex % ROUNDS.length];
  const drag = useDragRound({
    zoneSelector: '[data-drop-result]',
    correctSelector: '[data-drop-result="correct"]',
    assistLevel,
    onRoundComplete,
    onRetry,
  });

  return (
    <section className="drag-game">
      <p className="game-prompt">{round.label}</p>
      <ListenButton text={round.label} speak={speak} />
      <div className="drag-stage">
        <button
          type="button"
          className={`drag-item${drag.isDragging ? ' is-dragging' : ''}`}
          data-testid="drag-item"
          aria-label={round.item}
          style={{ transform: `translate(${drag.translation.x}px, ${drag.translation.y}px)` }}
          onPointerDown={drag.onPointerDown}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
          onPointerCancel={drag.onPointerCancel}
          onLostPointerCapture={drag.onLostPointerCapture}
        >
          {round.item}
        </button>
        <div className="drop-zone" data-drop-result="correct" data-testid="correct-zone" data-assist={assistLevel || undefined}>
          <span aria-hidden="true">{round.target}</span>
          <span>{round.targetLabel}</span>
        </div>
        <div className="drop-zone" data-drop-result="wrong" data-testid="wrong-zone">
          <span aria-hidden="true">{round.decoy}</span>
          <span>{round.decoyLabel}</span>
        </div>
      </div>
    </section>
  );
}
