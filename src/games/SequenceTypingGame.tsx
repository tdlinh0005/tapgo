import ListenButton from '../components/ListenButton';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const SEQUENCES = ['ASD', 'ASDF', 'JKL', 'JKLM', 'FGH', 'ASDFG', 'QWE', 'RTYU'] as const;

export default function SequenceTypingGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const sequence = SEQUENCES[roundIndex % SEQUENCES.length];
  const keyIndex = useKeySequence(sequence, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Gõ chuỗi phím">
      <p className="game-prompt">Gõ theo thứ tự</p>
      <div className="typing-sequence">
        {sequence.split('').map((character, index) => (
          <span
            key={`${character}-${index}`}
            data-state={index < keyIndex ? 'done' : index === keyIndex ? 'active' : 'todo'}
            data-assist={index === keyIndex ? assistLevel || undefined : undefined}
          >
            {character}
          </span>
        ))}
      </div>
      <ListenButton text={`Gõ theo thứ tự ${sequence.split('').join(' ')}`} speak={speak} />
    </section>
  );
}
