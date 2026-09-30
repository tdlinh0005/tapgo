import { useState } from 'react';
import type { MiniGameProps } from '../game/types';

const ROUNDS = [
  { prompt: 'Click con mèo', answer: '🐱', options: ['🐱', '🐶', '🐰'] },
  { prompt: 'Click ô tô', answer: '🚗', options: ['🚌', '🚗', '🚲'] },
  { prompt: 'Click tên lửa', answer: '🚀', options: ['⭐', '🚀', '🌙'] },
  { prompt: 'Click quả táo', answer: '🍎', options: ['🍌', '🍎', '🍇'] },
  { prompt: 'Click con cá', answer: '🐟', options: ['🐟', '🐸', '🐦'] },
  { prompt: 'Click quả bóng', answer: '⚽', options: ['🎈', '⚽', '🧸'] },
  { prompt: 'Click ngôi sao', answer: '⭐', options: ['🌙', '☀️', '⭐'] },
  { prompt: 'Click xe đạp', answer: '🚲', options: ['🚲', '🚗', '🚂'] },
  { prompt: 'Click con thỏ', answer: '🐰', options: ['🐻', '🐰', '🐱'] },
  { prompt: 'Click mặt trời', answer: '☀️', options: ['⭐', '☀️', '🌙'] },
] as const;

export default function PickPictureGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const round = ROUNDS[roundIndex % ROUNDS.length];
  const [attempts, setAttempts] = useState(0);

  const choose = (option: string) => {
    const nextAttempts = attempts + 1;
    if (option === round.answer) {
      onRoundComplete({ correct: 1, attempts: nextAttempts });
    } else {
      setAttempts(nextAttempts);
      onRetry?.();
    }
  };

  return (
    <section className="picture-game">
      <p className="game-prompt">{round.prompt}</p>
      <button type="button" className="listen-button" onClick={() => speak(round.prompt)}>
        <span aria-hidden="true">🔊</span> Nghe yêu cầu
      </button>
      <div className="picture-options">
        {round.options.map((option) => (
          <button
            type="button"
            className="picture-option"
            aria-label={option}
            data-correct={assistLevel >= 2 && option === round.answer ? 'true' : undefined}
            key={option}
            onClick={() => choose(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
