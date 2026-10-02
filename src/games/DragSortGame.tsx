import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { pickRound, shuffleWithSeed } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';
import { useDragRound } from '../hooks/usePointerDrag';

export const SORT_ROUNDS = [
  { item: '🍎', target: '🧺', targetLabel: 'Giỏ', label: 'Kéo quả táo vào giỏ', decoy: '📦', decoyLabel: 'Hộp' },
  { item: '🍌', target: '🧺', targetLabel: 'Giỏ', label: 'Kéo quả chuối vào giỏ', decoy: '🎒', decoyLabel: 'Ba lô' },
  { item: '🚗', target: '🅿️', targetLabel: 'Chỗ đỗ', label: 'Kéo ô tô vào chỗ đỗ', decoy: '🏠', decoyLabel: 'Nhà' },
  { item: '🚲', target: '🅿️', targetLabel: 'Chỗ đỗ', label: 'Kéo xe đạp vào chỗ đỗ', decoy: '🌳', decoyLabel: 'Cây' },
  { item: '🐱', target: '🏠', targetLabel: 'Nhà', label: 'Kéo mèo về nhà', decoy: '🧺', decoyLabel: 'Giỏ' },
  { item: '🐶', target: '🏠', targetLabel: 'Nhà', label: 'Kéo chó về nhà', decoy: '🌌', decoyLabel: 'Bầu trời' },
  { item: '🚀', target: '🌌', targetLabel: 'Bầu trời', label: 'Kéo tên lửa lên trời', decoy: '🅿️', decoyLabel: 'Chỗ đỗ' },
  { item: '⭐', target: '🌌', targetLabel: 'Bầu trời', label: 'Kéo ngôi sao lên trời', decoy: '🏠', decoyLabel: 'Nhà' },
  { item: '🍇', target: '🧺', targetLabel: 'Giỏ', label: 'Kéo chùm nho vào giỏ', decoy: '🌳', decoyLabel: 'Cây' },
  { item: '🍊', target: '🧺', targetLabel: 'Giỏ', label: 'Kéo quả cam vào giỏ', decoy: '🅿️', decoyLabel: 'Chỗ đỗ' },
  { item: '🚌', target: '🅿️', targetLabel: 'Chỗ đỗ', label: 'Kéo xe buýt vào chỗ đỗ', decoy: '🧺', decoyLabel: 'Giỏ' },
  { item: '🛵', target: '🅿️', targetLabel: 'Chỗ đỗ', label: 'Kéo xe máy vào chỗ đỗ', decoy: '🌌', decoyLabel: 'Bầu trời' },
  { item: '🐰', target: '🏠', targetLabel: 'Nhà', label: 'Kéo thỏ về nhà', decoy: '🅿️', decoyLabel: 'Chỗ đỗ' },
  { item: '🐹', target: '🏠', targetLabel: 'Nhà', label: 'Kéo chuột hamster về nhà', decoy: '🌳', decoyLabel: 'Cây' },
  { item: '🌙', target: '🌌', targetLabel: 'Bầu trời', label: 'Kéo mặt trăng lên trời', decoy: '🧺', decoyLabel: 'Giỏ' },
  { item: '✈️', target: '🌌', targetLabel: 'Bầu trời', label: 'Kéo máy bay lên trời', decoy: '🏠', decoyLabel: 'Nhà' },
  { item: '🐦', target: '🌳', targetLabel: 'Cây', label: 'Kéo chú chim lên cây', decoy: '🅿️', decoyLabel: 'Chỗ đỗ' },
  { item: '🐒', target: '🌳', targetLabel: 'Cây', label: 'Kéo chú khỉ lên cây', decoy: '🧺', decoyLabel: 'Giỏ' },
] as const;

export default function DragSortGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const round = pickRound(SORT_ROUNDS, roundIndex, sessionSeed);
  const zoneOrder = sessionSeed === undefined ? ['correct', 'wrong'] : shuffleWithSeed(['correct', 'wrong'], sessionSeed + roundIndex);
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
          <Emoji char={round.item} />
        </button>
        {zoneOrder.map((zone) =>
          zone === 'correct' ? (
            <div key="correct" className="drop-zone" data-drop-result="correct" data-testid="correct-zone" data-assist={assistLevel || undefined}>
              <span aria-hidden="true"><Emoji char={round.target} /></span>
              <span>{round.targetLabel}</span>
            </div>
          ) : (
            <div key="wrong" className="drop-zone" data-drop-result="wrong" data-testid="wrong-zone">
              <span aria-hidden="true"><Emoji char={round.decoy} /></span>
              <span>{round.decoyLabel}</span>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
