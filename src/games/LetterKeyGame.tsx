import type { MiniGameProps } from '../game/types';
import { useExpectedKey } from '../hooks/useExpectedKey';

const LETTERS = ['A', 'M', 'S', 'L', 'P', 'E', 'B', 'C', 'N', 'T'] as const;

export default function LetterKeyGame({ roundIndex, onRoundComplete }: MiniGameProps) {
  const target = LETTERS[roundIndex % LETTERS.length];
  useExpectedKey(target, onRoundComplete);

  return (
    <section className="typing-game" aria-label="Gõ chữ cái">
      <p className="game-prompt">Bấm chữ này</p>
      <div className="key-target" aria-label={`Chữ ${target}`}>{target}</div>
    </section>
  );
}
