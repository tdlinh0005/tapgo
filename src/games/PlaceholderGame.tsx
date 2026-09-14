import type { MiniGameProps } from '../game/types';

export default function PlaceholderGame({ onRoundComplete }: MiniGameProps) {
  return (
    <section className="placeholder-game">
      <p>Trò chơi đang được chuẩn bị.</p>
      <button
        type="button"
        onClick={() => onRoundComplete({ correct: 1, attempts: 1 })}
      >
        Hoàn thành lượt
      </button>
    </section>
  );
}
