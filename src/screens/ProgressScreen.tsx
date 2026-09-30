import ActionButton from '../components/ActionButton';
import StarRating from '../components/StarRating';
import { getRecommendedGameId } from '../game/path';
import { gameRegistry, getGameDefinition } from '../game/registry';
import type { ProgressState } from '../game/progress';
import type { GameId } from '../game/types';

type Props = {
  progress: ProgressState;
  onPlay: (gameId: GameId) => void;
  onHome: () => void;
};

export default function ProgressScreen({ progress, onPlay, onHome }: Props) {
  const totalStars = gameRegistry.reduce(
    (sum, game) => sum + progress.games[game.id].bestStars,
    0,
  );
  const completed = gameRegistry.filter((game) => progress.games[game.id].completed).length;
  const totalPossibleStars = gameRegistry.length * 3;
  const recommended = getGameDefinition(getRecommendedGameId(progress));

  return (
    <main className="screen-shell progress-screen">
      <header className="screen-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <h1>Tiến độ</h1>
      </header>
      <div className="progress-summary">
        <strong>{totalStars} / {totalPossibleStars} sao</strong>
        <span>{completed} / {gameRegistry.length} bài đã hoàn thành</span>
      </div>
      <aside className="practice-recommendation" aria-label="Gợi ý luyện tập">
        <span aria-hidden="true">💡</span>
        <div>
          <strong>Gợi ý cho bố mẹ</strong>
          <p>Mình luyện thêm {recommended.title} một chút để nhớ lâu hơn nhé.</p>
        </div>
        <ActionButton icon={recommended.emoji} onClick={() => onPlay(recommended.id)}>
          Chơi {recommended.title}
        </ActionButton>
      </aside>
      <ul className="progress-list" aria-label="Tiến độ từng bài">
        {gameRegistry.map((game) => {
          const gameProgress = progress.games[game.id];
          return (
            <li key={game.id} className="progress-game" data-testid={`progress-${game.id}`}>
              <span className="progress-game-emoji" aria-hidden="true">{game.emoji}</span>
              <div className="progress-game-copy">
                <strong>{game.title}</strong>
                <span>{gameProgress.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span>
              </div>
              <StarRating stars={gameProgress.bestStars} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
