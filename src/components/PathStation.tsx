import type { CSSProperties } from 'react';
import type { GameDefinition } from '../game/types';
import GameArt from './GameArt';
import Mascot from './Mascot';
import StarRating from './StarRating';

type PathStationProps = {
  game: GameDefinition;
  step: number;
  stars: 0 | 1 | 2 | 3;
  completed: boolean;
  locked: boolean;
  recommended: boolean;
  style?: CSSProperties;
  onPlay: () => void;
};

export default function PathStation({ game, step, stars, completed, locked, recommended, style, onPlay }: PathStationProps) {
  const state = locked ? 'locked' : completed ? 'done' : 'open';

  return (
    <li
      className="path-station"
      data-category={game.category}
      data-state={state}
      data-recommended={recommended || undefined}
      style={style}
    >
      {recommended && <Mascot mood="cheer" moving />}
      <button
        type="button"
        className="path-station-stop"
        onClick={onPlay}
        disabled={locked}
        aria-label={locked ? `${game.title}: xong bài trước để mở` : `Chơi ${game.title}`}
      >
        <span className="path-station-emoji" aria-hidden="true">{locked ? '🔒' : <GameArt game={game} />}</span>
        <span className="path-station-step" aria-hidden="true">{step}</span>
      </button>
      <span className="path-station-title">{game.title}</span>
      <StarRating stars={stars} />
    </li>
  );
}
