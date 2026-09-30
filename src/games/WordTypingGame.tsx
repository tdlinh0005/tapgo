import ListenButton from '../components/ListenButton';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const WORDS = ['ME', 'BA', 'CON', 'MEO', 'CHO', 'NHA', 'XE', 'CA'] as const;

export default function WordTypingGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const word = WORDS[roundIndex % WORDS.length];
  const charIndex = useKeySequence(word, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Gõ từ ngắn">
      <p className="game-prompt">Gõ từ này</p>
      <div className="typing-sequence" role="img" aria-label={word}>
        {word.split('').map((character, index) => (
          <span
            key={`${character}-${index}`}
            data-state={index < charIndex ? 'done' : index === charIndex ? 'active' : 'todo'}
            data-assist={index === charIndex ? assistLevel || undefined : undefined}
          >
            {character}
          </span>
        ))}
      </div>
      <ListenButton text={`Gõ từ ${word}`} speak={speak} />
    </section>
  );
}
