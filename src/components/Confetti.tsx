import type { CSSProperties } from 'react';

const CONFETTI_EMOJI = ['🎉', '⭐', '🎈', '✨'];
const PIECE_COUNT = 14;
const DELAY_STEP_MS = 60;

export const CONFETTI_PIECES = Array.from({ length: PIECE_COUNT }, (_, index) => ({
  emoji: CONFETTI_EMOJI[index % CONFETTI_EMOJI.length],
  left: Math.round(((index * 37) % 100) * 0.9 + 5),
  delayMs: (index % 7) * DELAY_STEP_MS * 2 + (index >= 7 ? DELAY_STEP_MS : 0),
}));

export default function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {CONFETTI_PIECES.map((piece, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{ '--confetti-left': `${piece.left}%`, '--confetti-delay': `${piece.delayMs}ms` } as CSSProperties}
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  );
}
