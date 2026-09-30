import { useEffect, useRef, useState } from 'react';
import ListenButton from '../components/ListenButton';
import { keyRetryHint } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';

export const SEQUENCES = ['ASD', 'ASDF', 'JKL', 'JKLM', 'FGH', 'ASDFG', 'QWE', 'RTYU'] as const;

export default function SequenceTypingGame({ roundIndex, onRoundComplete, onRetry, speak }: MiniGameProps) {
  const sequence = SEQUENCES[roundIndex % SEQUENCES.length];
  const [keyIndex, setKeyIndex] = useState(0);
  const attempts = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
      event.preventDefault();
      if (event.key === ' ' && sequence[keyIndex] !== ' ') return;

      attempts.current += 1;
      if (event.key.toUpperCase() !== sequence[keyIndex]) {
        onRetry?.(keyRetryHint(sequence[keyIndex]));
        return;
      }

      const nextIndex = keyIndex + 1;
      if (nextIndex >= sequence.length) {
        onRoundComplete({ correct: sequence.length, attempts: attempts.current });
      } else {
        setKeyIndex(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyIndex, sequence, onRoundComplete, onRetry]);

  return (
    <section className="typing-game" aria-label="Gõ chuỗi phím">
      <p className="game-prompt">Gõ theo thứ tự</p>
      <div className="typing-sequence">
        {sequence.split('').map((character, index) => (
          <span key={`${character}-${index}`} data-state={index < keyIndex ? 'done' : index === keyIndex ? 'active' : 'todo'}>
            {character}
          </span>
        ))}
      </div>
      <ListenButton text={`Gõ theo thứ tự ${sequence.split('').join(' ')}`} speak={speak} />
    </section>
  );
}
