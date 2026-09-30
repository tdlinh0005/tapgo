import { useEffect, useRef, useState } from 'react';
import type { MiniGameProps } from '../game/types';

const WORDS = ['ME', 'BA', 'CON', 'MEO', 'CHO', 'NHA', 'XE', 'CA'] as const;

export default function WordTypingGame({ roundIndex, onRoundComplete, onRetry }: MiniGameProps) {
  const word = WORDS[roundIndex % WORDS.length];
  const [charIndex, setCharIndex] = useState(0);
  const attempts = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
      event.preventDefault();
      if (event.key === ' ' && word[charIndex] !== ' ') return;

      attempts.current += 1;
      if (event.key.toUpperCase() !== word[charIndex]) {
        onRetry?.(`Hãy tìm chữ ${word[charIndex]} trên màn hình nhé.`);
        return;
      }

      const nextIndex = charIndex + 1;
      if (nextIndex >= word.length) {
        onRoundComplete({ correct: word.length, attempts: attempts.current });
      } else {
        setCharIndex(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [charIndex, word, onRoundComplete, onRetry]);

  return (
    <section className="typing-game" aria-label="Gõ từ ngắn">
      <p className="game-prompt">Gõ từ này</p>
      <div className="typing-sequence" aria-label={word}>
        {word.split('').map((character, index) => (
          <span key={`${character}-${index}`} data-active={index === charIndex ? 'true' : 'false'}>
            {character}
          </span>
        ))}
      </div>
    </section>
  );
}
