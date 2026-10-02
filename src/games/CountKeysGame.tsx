import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { pickRound } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const COUNT_ITEMS = [
  { emoji: '🍎', name: 'quả táo' },
  { emoji: '🐟', name: 'con cá' },
  { emoji: '⭐', name: 'ngôi sao' },
  { emoji: '🎈', name: 'quả bóng bay' },
  { emoji: '🐥', name: 'chú gà con' },
  { emoji: '🍓', name: 'quả dâu' },
  { emoji: '🚗', name: 'chiếc ô tô' },
  { emoji: '🌸', name: 'bông hoa' },
  { emoji: '🐞', name: 'con bọ rùa' },
  { emoji: '🍌', name: 'quả chuối' },
] as const;

export default function CountKeysGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const count = pickRound(COUNTS, roundIndex, sessionSeed);
  const { emoji, name } = pickRound(COUNT_ITEMS, roundIndex, sessionSeed);
  const question = `Có mấy ${name}?`;
  useKeySequence(String(count), onRoundComplete, onRetry, () => `${RETRY_PREFIX} Đếm lại từng ${name} nhé.`);

  return (
    <section className="typing-game" aria-label="Đếm rồi bấm số">
      <p className="game-prompt">{question}</p>
      <div className="count-row">
        <div className="count-grid" role="img" aria-label={`${count} ${name}`}>
          {Array.from({ length: count }, (_, index) => (
            <span key={index} className="count-item" aria-hidden="true">
              <Emoji char={emoji} />
              {assistLevel >= 1 && <span className="count-number">{index + 1}</span>}
            </span>
          ))}
        </div>
        <div className="key-target" data-assist={assistLevel || undefined} aria-hidden="true">
          {assistLevel === 2 ? count : '?'}
        </div>
      </div>
      <ListenButton text={`${question} Bấm số đó`} speak={speak} />
    </section>
  );
}
