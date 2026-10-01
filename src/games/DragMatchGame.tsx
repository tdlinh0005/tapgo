import ListenButton from '../components/ListenButton';
import { pickRound, shuffleWithSeed } from '../game/pickRound';
import type { GameLevel, MiniGameProps } from '../game/types';
import { useDragRound } from '../hooks/usePointerDrag';

export const MATCH_ROUNDS = [
  { source: '🐱', answer: 'Mèo', options: [['🐱', 'Mèo'], ['🐟', 'Cá'], ['🌳', 'Cây']] },
  { source: '🐶', answer: 'Chó', options: [['🦋', 'Bướm'], ['🐶', 'Chó'], ['🚗', 'Ô tô']] },
  { source: '🐰', answer: 'Thỏ', options: [['🍎', 'Táo'], ['⭐', 'Ngôi sao'], ['🐰', 'Thỏ']] },
  { source: '🚗', answer: 'Ô tô', options: [['🚀', 'Tên lửa'], ['🚗', 'Ô tô'], ['🌙', 'Mặt trăng']] },
  { source: '🚲', answer: 'Xe đạp', options: [['🚲', 'Xe đạp'], ['🐘', 'Voi'], ['🍌', 'Chuối']] },
  { source: '🚀', answer: 'Tên lửa', options: [['⭐', 'Ngôi sao'], ['🏠', 'Nhà'], ['🚀', 'Tên lửa']] },
  { source: '🍎', answer: 'Táo', options: [['🍌', 'Chuối'], ['🍎', 'Táo'], ['🚲', 'Xe đạp']] },
  { source: '⚽', answer: 'Bóng', options: [['⚽', 'Bóng'], ['🦒', 'Hươu cao cổ'], ['🚂', 'Tàu hỏa']] },
  { source: '🐘', answer: 'Voi', options: [['🐘', 'Voi'], ['🐭', 'Chuột'], ['☀️', 'Mặt trời']] },
  { source: '🦆', answer: 'Vịt', options: [['🌳', 'Cây'], ['🦆', 'Vịt'], ['🚂', 'Tàu hỏa']] },
  { source: '🐢', answer: 'Rùa', options: [['🍎', 'Táo'], ['🚲', 'Xe đạp'], ['🐢', 'Rùa']] },
  { source: '🦋', answer: 'Bướm', options: [['🦋', 'Bướm'], ['🐟', 'Cá'], ['🚀', 'Tên lửa']] },
  { source: '✈️', answer: 'Máy bay', options: [['🐶', 'Chó'], ['✈️', 'Máy bay'], ['🍌', 'Chuối']] },
  { source: '🚂', answer: 'Tàu hỏa', options: [['⭐', 'Ngôi sao'], ['🐰', 'Thỏ'], ['🚂', 'Tàu hỏa']] },
  { source: '🍌', answer: 'Chuối', options: [['🍌', 'Chuối'], ['🚗', 'Ô tô'], ['🐱', 'Mèo']] },
  { source: '🍇', answer: 'Nho', options: [['🏠', 'Nhà'], ['🍇', 'Nho'], ['🦒', 'Hươu cao cổ']] },
  { source: '🌙', answer: 'Mặt trăng', options: [['🌙', 'Mặt trăng'], ['🐘', 'Voi'], ['⚽', 'Bóng']] },
  { source: '🏠', answer: 'Nhà', options: [['🚲', 'Xe đạp'], ['🐢', 'Rùa'], ['🏠', 'Nhà']] },
  { source: '⭐', answer: 'Ngôi sao', options: [['🐶', 'Chó'], ['⭐', 'Ngôi sao'], ['🍎', 'Táo']] },
  { source: '🌳', answer: 'Cây', options: [['🌳', 'Cây'], ['🚀', 'Tên lửa'], ['🐰', 'Thỏ']] },
] as const;

export const MATCH_GROUPS: Record<string, readonly string[]> = {
  animal: ['🐱', '🐶', '🐰', '🐘', '🦆', '🐢', '🦋', '🐟', '🐭', '🦒'],
  vehicle: ['🚗', '🚲', '🚀', '✈️', '🚂'],
  food: ['🍎', '🍌', '🍇'],
  thing: ['⚽', '🌙', '🏠', '⭐', '🌳', '☀️'],
};

type MatchRound = (typeof MATCH_ROUNDS)[number];
type MatchOption = readonly [string, string];

const SHADOW_LABELS = new Map<string, string>(MATCH_ROUNDS.flatMap(({ options }) => options.map(([emoji, label]) => [emoji, label] as const)));

export function matchGroup(emoji: string): string | undefined {
  return Object.keys(MATCH_GROUPS).find((group) => MATCH_GROUPS[group].includes(emoji));
}

// Higher levels swap off-group decoy shadows for shadows from the source's own group.
export function matchOptions(round: MatchRound, level: GameLevel, roundIndex: number, sessionSeed?: number): readonly MatchOption[] {
  if (level === 0) return round.options;
  const group = matchGroup(round.source);
  const shown = round.options.map(([emoji]) => emoji as string);
  const similar = shuffleWithSeed(
    MATCH_GROUPS[group ?? '']?.filter((emoji) => !shown.includes(emoji) && SHADOW_LABELS.has(emoji)) ?? [],
    (sessionSeed ?? 0) + roundIndex,
  );
  let swaps: number = level;
  return round.options.map((option) => {
    const [emoji, label] = option;
    if (label === round.answer || matchGroup(emoji) === group || swaps === 0) return option;
    const replacement = similar.shift();
    if (!replacement) return option;
    swaps -= 1;
    return [replacement, SHADOW_LABELS.get(replacement)!] as const;
  });
}

export default function DragMatchGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0, level = 0 }: MiniGameProps) {
  const round = pickRound(MATCH_ROUNDS, roundIndex, sessionSeed);
  const options = matchOptions(round, level, roundIndex, sessionSeed);
  const instruction = `Kéo ${round.answer.toLowerCase()} vào đúng cái bóng của nó`;

  const drag = useDragRound({
    zoneSelector: '[data-match-label]',
    correctSelector: '[data-match-correct="true"]',
    assistLevel,
    onRoundComplete,
    onRetry,
  });

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
          {options.map(([emoji, label]) => (
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
