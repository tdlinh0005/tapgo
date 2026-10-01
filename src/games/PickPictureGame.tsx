import { useState } from 'react';
import ListenButton from '../components/ListenButton';
import { pickRound, shuffleWithSeed } from '../game/pickRound';
import type { GameLevel, MiniGameProps } from '../game/types';

export const PICTURE_ROUNDS = [
  { theme: 'animal', prompt: 'Click con mèo', answer: '🐱', options: ['🐱', '🐶', '🐰'] },
  { theme: 'vehicle', prompt: 'Click ô tô', answer: '🚗', options: ['🚌', '🚗', '🚲'] },
  { theme: 'vehicle', prompt: 'Click tên lửa', answer: '🚀', options: ['✈️', '🚀', '🚁'] },
  { theme: 'food', prompt: 'Click quả táo', answer: '🍎', options: ['🍌', '🍎', '🍇'] },
  { theme: 'animal', prompt: 'Click con cá', answer: '🐟', options: ['🐟', '🐸', '🐦'] },
  { theme: 'sky', prompt: 'Click đám mây', answer: '☁️', options: ['🌈', '☁️', '☀️'] },
  { theme: 'sky', prompt: 'Click ngôi sao', answer: '⭐', options: ['🌙', '☀️', '⭐'] },
  { theme: 'vehicle', prompt: 'Click xe đạp', answer: '🚲', options: ['🚲', '🚗', '🚂'] },
  { theme: 'animal', prompt: 'Click con thỏ', answer: '🐰', options: ['🐻', '🐰', '🐱'] },
  { theme: 'sky', prompt: 'Click mặt trời', answer: '☀️', options: ['⭐', '☀️', '🌙'] },
  { theme: 'animal', prompt: 'Click con voi', answer: '🐘', options: ['🐘', '🦒', '🐒'] },
  { theme: 'animal', prompt: 'Click con vịt', answer: '🦆', options: ['🐔', '🦆', '🐦'] },
  { theme: 'animal', prompt: 'Click con rùa', answer: '🐢', options: ['🐸', '🐍', '🐢'] },
  { theme: 'animal', prompt: 'Click con ong', answer: '🐝', options: ['🦋', '🐝', '🐞'] },
  { theme: 'animal', prompt: 'Click con bò', answer: '🐄', options: ['🐄', '🐖', '🐐'] },
  { theme: 'vehicle', prompt: 'Click tàu hỏa', answer: '🚂', options: ['🚌', '🚗', '🚂'] },
  { theme: 'vehicle', prompt: 'Click máy bay', answer: '✈️', options: ['✈️', '🚀', '⛵'] },
  { theme: 'vehicle', prompt: 'Click thuyền buồm', answer: '⛵', options: ['🚗', '⛵', '🚲'] },
  { theme: 'vehicle', prompt: 'Click trực thăng', answer: '🚁', options: ['✈️', '🚀', '🚁'] },
  { theme: 'vehicle', prompt: 'Click xe buýt', answer: '🚌', options: ['🚌', '🚲', '🚂'] },
  { theme: 'food', prompt: 'Click quả chuối', answer: '🍌', options: ['🍓', '🍌', '🍊'] },
  { theme: 'food', prompt: 'Click chùm nho', answer: '🍇', options: ['🍎', '🍉', '🍇'] },
  { theme: 'food', prompt: 'Click dưa hấu', answer: '🍉', options: ['🍉', '🍍', '🥕'] },
  { theme: 'food', prompt: 'Click cà rốt', answer: '🥕', options: ['🌽', '🥕', '🍆'] },
  { theme: 'food', prompt: 'Click quả dâu', answer: '🍓', options: ['🍒', '🍎', '🍓'] },
  { theme: 'food', prompt: 'Click cây kem', answer: '🍦', options: ['🍦', '🍰', '🍩'] },
  { theme: 'food', prompt: 'Click quả trứng', answer: '🥚', options: ['🍞', '🥚', '🧀'] },
  { theme: 'sky', prompt: 'Click mặt trăng', answer: '🌙', options: ['🌙', '☁️', '⭐'] },
  { theme: 'sky', prompt: 'Click cầu vồng', answer: '🌈', options: ['☁️', '❄️', '🌈'] },
  { theme: 'sky', prompt: 'Click bông tuyết', answer: '❄️', options: ['❄️', '💧', '⚡'] },
  { theme: 'sky', prompt: 'Click tia chớp', answer: '⚡', options: ['☀️', '⚡', '☁️'] },
  { theme: 'sky', prompt: 'Click giọt nước', answer: '💧', options: ['❄️', '🌙', '💧'] },
] as const;

type PictureRound = (typeof PICTURE_ROUNDS)[number];

// Level 1 adds one same-theme decoy; level 2 makes every decoy same-theme.
export function pictureOptions(round: PictureRound, level: GameLevel, roundIndex: number, sessionSeed?: number): readonly string[] {
  if (level === 0) return round.options;
  const sameTheme = PICTURE_ROUNDS.filter(({ theme, answer }) => theme === round.theme && answer !== round.answer).map(({ answer }) => answer);
  const decoys = shuffleWithSeed(sameTheme, (sessionSeed ?? 0) + roundIndex);
  if (level === 2) return [round.answer, ...decoys.slice(0, 3)];
  const extra = decoys.find((decoy) => !(round.options as readonly string[]).includes(decoy));
  return extra ? [...round.options, extra] : round.options;
}

export default function PickPictureGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0, level = 0 }: MiniGameProps) {
  const round = pickRound(PICTURE_ROUNDS, roundIndex, sessionSeed);
  const choices = pictureOptions(round, level, roundIndex, sessionSeed);
  const options = sessionSeed === undefined ? choices : shuffleWithSeed(choices, sessionSeed + roundIndex);
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
      <ListenButton text={round.prompt} speak={speak} />
      <div className="picture-options">
        {options.map((option) => (
          <button
            type="button"
            className="picture-option"
            aria-label={option}
            data-assist={option === round.answer ? assistLevel || undefined : undefined}
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
