import { useState, type MouseEvent } from 'react';
import ListenButton from '../components/ListenButton';
import { pickRound } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';

export const SAFE_AREA = { left: [14, 80], top: [18, 72] } as const;

export const CLICK_TARGETS = [
  { emoji: '⭐', name: 'ngôi sao' },
  { emoji: '🎈', name: 'quả bóng bay' },
  { emoji: '🦋', name: 'con bướm' },
  { emoji: '🐞', name: 'con bọ rùa' },
  { emoji: '🪐', name: 'hành tinh' },
  { emoji: '🍎', name: 'quả táo' },
  { emoji: '🐠', name: 'con cá' },
  { emoji: '🌸', name: 'bông hoa' },
  { emoji: '🚀', name: 'tên lửa' },
  { emoji: '🐝', name: 'con ong' },
  { emoji: '🍦', name: 'cây kem' },
  { emoji: '🎁', name: 'hộp quà' },
  { emoji: '🐥', name: 'chú gà con' },
] as const;

const randomBetween = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

export default function ClickTargetGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const target = pickRound(CLICK_TARGETS, roundIndex, sessionSeed);
  const prompt = `Click vào ${target.name}`;
  const [attempts, setAttempts] = useState(0);
  const [{ left, top }] = useState(() => ({ left: randomBetween(SAFE_AREA.left), top: randomBetween(SAFE_AREA.top) }));

  const handleMiss = () => {
    setAttempts((current) => current + 1);
    onRetry?.();
  };

  const handleTarget = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRoundComplete({ correct: 1, attempts: attempts + 1 });
  };

  return (
    <>
      <p className="game-prompt">{prompt}</p>
      <ListenButton text={prompt} speak={speak} />
      <section
        className="click-play-area"
        data-testid="play-area"
        onClick={handleMiss}
        aria-label="Khu vực luyện click"
      >
        <button
          type="button"
          className="click-target"
          data-assist={assistLevel || undefined}
          aria-label="Mục tiêu"
          onClick={handleTarget}
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <span className="click-target-visual" aria-hidden="true">{target.emoji}</span>
        </button>
      </section>
    </>
  );
}
