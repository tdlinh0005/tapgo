import type { GameDefinition } from '../game/types';

type GameCardProps = {
  game: GameDefinition;
  stars: 0 | 1 | 2 | 3;
  locked?: boolean;
  onPlay: () => void;
};

export default function GameCard({ game, stars, locked = false, onPlay }: GameCardProps) {
  return (
    <article className={`game-card${locked ? ' is-locked' : ''}`} data-testid="game-card" data-category={game.category}>
      <span className="game-card-emoji" aria-hidden="true">{game.emoji}</span>
      <div className="game-card-copy">
        <h2>{game.title}</h2>
        <span role="img" aria-label={`${stars} sao`}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
      </div>
      <button
        type="button"
        onClick={onPlay}
        disabled={locked}
        aria-label={locked ? `${game.title}: xong bài trước để mở` : `Chơi ${game.title}`}
      >
        {locked ? '🔒 Xong bài trước để mở' : 'Chơi'}
      </button>
    </article>
  );
}
