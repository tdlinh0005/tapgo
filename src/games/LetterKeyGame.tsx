import { useEffect, useRef } from 'react';
import type { MiniGameProps } from '../game/types';

const LETTERS = ['A', 'M', 'S', 'L', 'P', 'E', 'B', 'C', 'N', 'T'] as const;

export default function LetterKeyGame({ roundIndex, onRoundComplete }: MiniGameProps) {
  const target = LETTERS[roundIndex % LETTERS.length];
  const attempts = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;

      attempts.current += 1;
      if (event.key.toUpperCase() === target) {
        onRoundComplete({ correct: 1, attempts: attempts.current });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, onRoundComplete]);

  return (
    <section className="typing-game" aria-label="Gõ chữ cái">
      <p className="game-prompt">Bấm chữ này</p>
      <div className="key-target" aria-label={`Chữ ${target}`}>{target}</div>
    </section>
  );
}
