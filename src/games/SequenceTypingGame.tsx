import { useEffect, useRef, useState } from 'react';
import type { MiniGameProps } from '../game/types';

const SEQUENCES = ['ASD', 'JKL', 'QWE', 'RTY', 'ABC', 'MEO', 'CON', 'NHA'] as const;

export default function SequenceTypingGame({ roundIndex, onRoundComplete, onRetry }: MiniGameProps) {
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
        onRetry?.();
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
          <span key={`${character}-${index}`} data-active={index === keyIndex ? 'true' : 'false'}>
            {character}
          </span>
        ))}
      </div>
    </section>
  );
}
