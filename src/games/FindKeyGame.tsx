import ListenButton from '../components/ListenButton';
import type { MiniGameProps } from '../game/types';
import { useExpectedKey } from '../hooks/useExpectedKey';

export const TARGETS = ['Q', 'G', 'H', 'K', 'R', 'U', 'V', 'Y', 'D', 'O'] as const;

export default function FindKeyGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const target = TARGETS[roundIndex % TARGETS.length];
  const instruction = `Hãy bấm chữ ${target}`;
  useExpectedKey(target, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Tìm phím đúng">
      <p className="game-prompt">{instruction}</p>
      <div className="key-target" data-assist={assistLevel || undefined} aria-hidden="true">{target}</div>
      <ListenButton text={instruction} speak={speak} />
    </section>
  );
}
