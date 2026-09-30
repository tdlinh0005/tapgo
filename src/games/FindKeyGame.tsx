import type { MiniGameProps } from '../game/types';
import { useExpectedKey } from '../hooks/useExpectedKey';

export const TARGETS = ['Q', 'G', 'H', 'K', 'R', 'U', 'V', 'Y', 'D', 'O'] as const;

export default function FindKeyGame({ roundIndex, onRoundComplete, onRetry, speak }: MiniGameProps) {
  const target = TARGETS[roundIndex % TARGETS.length];
  const instruction = `Hãy bấm chữ ${target}`;
  useExpectedKey(target, onRoundComplete, onRetry);

  return (
    <section className="typing-game find-key-game" aria-label="Tìm phím đúng">
      <p className="game-prompt">{instruction}</p>
      <div className="key-target" aria-hidden="true">{target}</div>
      <button type="button" className="listen-button" onClick={() => speak(instruction)}>
        <span aria-hidden="true">🔊</span> Nghe yêu cầu
      </button>
    </section>
  );
}
