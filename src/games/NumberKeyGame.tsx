import ListenButton from '../components/ListenButton';
import type { MiniGameProps } from '../game/types';
import { useExpectedKey } from '../hooks/useExpectedKey';

const NUMBERS = ['1', '5', '9', '2', '8', '3', '7', '4', '6', '0'] as const;

export default function NumberKeyGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const target = NUMBERS[roundIndex % NUMBERS.length];
  useExpectedKey(target, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Gõ số">
      <p className="game-prompt">Bấm số này</p>
      <div className="key-target" data-assist={assistLevel || undefined} role="img" aria-label={`Số ${target}`}>{target}</div>
      <ListenButton text={`Bấm số ${target}`} speak={speak} />
    </section>
  );
}
