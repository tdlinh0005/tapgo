import type { MiniGameProps } from '../game/types';
import { useExpectedKey } from '../hooks/useExpectedKey';

const NUMBERS = ['1', '5', '9', '2', '8', '3', '7', '4', '6', '0'] as const;

export default function NumberKeyGame({ roundIndex, onRoundComplete, onRetry }: MiniGameProps) {
  const target = NUMBERS[roundIndex % NUMBERS.length];
  useExpectedKey(target, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Gõ số">
      <p className="game-prompt">Bấm số này</p>
      <div className="key-target" aria-label={`Số ${target}`}>{target}</div>
    </section>
  );
}
