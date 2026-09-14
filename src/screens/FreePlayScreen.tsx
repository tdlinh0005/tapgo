import GameCard from '../components/GameCard';
import { gameRegistry } from '../game/registry';
import type { ProgressState } from '../game/progress';
import type { GameId } from '../game/types';

type Props = {
  progress: ProgressState;
  onPlay: (gameId: GameId) => void;
  onHome: () => void;
};

export default function FreePlayScreen({ progress, onPlay, onHome }: Props) {
  return (
    <main className="screen-shell">
      <header className="screen-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <h1>Chơi tự do</h1>
      </header>
      <div className="game-grid">
        {gameRegistry.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            stars={progress.games[game.id].bestStars}
            onPlay={() => onPlay(game.id)}
          />
        ))}
      </div>
    </main>
  );
}
