import { useState } from 'react';
import ActionButton from '../components/ActionButton';
import GameArt from '../components/GameArt';
import StarRating from '../components/StarRating';
import { getRecommendedGameId } from '../game/path';
import { gameRegistry, getGameDefinition } from '../game/registry';
import type { ProgressState } from '../game/progress';
import type { GameId } from '../game/types';

type Props = {
  progress: ProgressState;
  onPlay: (gameId: GameId) => void;
  onHome: () => void;
  onReset: () => void;
};

export default function ProgressScreen({ progress, onPlay, onHome, onReset }: Props) {
  const [resetStep, setResetStep] = useState<'idle' | 'confirm' | 'done'>('idle');
  const totalStars = gameRegistry.reduce(
    (sum, game) => sum + progress.games[game.id].bestStars,
    0,
  );
  const completed = gameRegistry.filter((game) => progress.games[game.id].completed).length;
  const totalPossibleStars = gameRegistry.length * 3;
  const jarFill = `${Math.round((totalStars / totalPossibleStars) * 100)}%`;
  const recommended = getGameDefinition(getRecommendedGameId(progress));
  const hasProgress = gameRegistry.some((game) => progress.games[game.id].plays > 0);

  const confirmReset = () => {
    onReset();
    setResetStep('done');
  };

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <h1>Tiến độ</h1>
      </header>
      <div className="progress-summary">
        <span className="star-jar" aria-hidden="true">
          <span className="star-jar-fill" style={{ height: jarFill }} />
          <span className="star-jar-icon">⭐</span>
        </span>
        <div className="progress-summary-copy">
          <strong>{totalStars} / {totalPossibleStars} sao</strong>
          <span>{completed} / {gameRegistry.length} bài đã hoàn thành</span>
        </div>
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
            <li
              key={game.id}
              className="progress-game"
              data-testid={`progress-${game.id}`}
              data-category={game.category}
              data-state={gameProgress.completed ? 'collected' : 'missing'}
            >
              <span className="progress-sticker" aria-hidden="true"><GameArt game={game} /></span>
              <div className="progress-game-copy">
                <strong>{game.title}</strong>
                <span>{gameProgress.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span>
              </div>
              <StarRating stars={gameProgress.bestStars} />
            </li>
          );
        })}
      </ul>
      <section className="progress-reset" aria-label="Bắt đầu lại" data-step={resetStep}>
        {resetStep === 'confirm' ? (
          <>
            <p>Xoá hết sao và bài đã hoàn thành? Xoá rồi không lấy lại được.</p>
            <div className="progress-reset-actions">
              <button type="button" className="progress-reset-keep" onClick={() => setResetStep('idle')} autoFocus>Không xoá</button>
              <button type="button" className="progress-reset-confirm" onClick={confirmReset}>Xoá hết, bắt đầu lại</button>
            </div>
          </>
        ) : (
          <>
            <p role="status">{resetStep === 'done' ? 'Đã xoá tiến độ. Bé bắt đầu lại từ bài 1 nhé.' : 'Dành cho bố mẹ: xoá hết tiến độ để bé chơi lại từ đầu.'}</p>
            <button type="button" className="progress-reset-open" onClick={() => setResetStep('confirm')} disabled={!hasProgress}>
              <span aria-hidden="true">🔄</span> Bắt đầu lại từ đầu
            </button>
          </>
        )}
      </section>
    </main>
  );
}
