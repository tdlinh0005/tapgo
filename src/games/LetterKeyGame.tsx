import ListenButton from '../components/ListenButton';
import type { MiniGameProps } from '../game/types';
import { useExpectedKey } from '../hooks/useExpectedKey';

export const LETTERS = ['A', 'M', 'S', 'L', 'P', 'E', 'B', 'C', 'N', 'T'] as const;

export default function LetterKeyGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const target = LETTERS[roundIndex % LETTERS.length];
  useExpectedKey(target, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Gõ chữ cái">
      <p className="game-prompt">Bấm chữ này</p>
      <div className="key-target" data-assist={assistLevel || undefined} role="img" aria-label={`Chữ ${target}`}>{target}</div>
      <ListenButton text={`Bấm chữ ${target}`} speak={speak} />
    </section>
  );
}
