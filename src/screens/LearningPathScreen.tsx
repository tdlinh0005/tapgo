import GameCard from '../components/GameCard';
import { gameRegistry } from '../game/registry';
import { isPathUnlocked } from '../game/path';
import type { ProgressState } from '../game/progress';
import type { GameId } from '../game/types';

type Props = {
  progress: ProgressState;
  onPlay: (gameId: GameId) => void;
  onHome: () => void;
};

export default function LearningPathScreen({ progress, onPlay, onHome }: Props) {
  return (
    <main className="screen-shell">
      <header className="screen-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <h1>Lộ trình học</h1>
      </header>
      <p>Đi từ bài dễ đến khó. Bé vẫn có thể chơi mọi bài trong Chơi tự do.</p>
      <div className="game-grid">
        {gameRegistry.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            stars={progress.games[game.id].bestStars}
            locked={!isPathUnlocked(game.id, progress)}
            onPlay={() => onPlay(game.id)}
          />
        ))}
      </div>
    </main>
  );
}
