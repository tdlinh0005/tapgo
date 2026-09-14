import { gameRegistry } from '../game/registry';
import type { ProgressState } from '../game/progress';

type Props = {
  progress: ProgressState;
  onHome: () => void;
};

export default function ProgressScreen({ progress, onHome }: Props) {
  const totalStars = gameRegistry.reduce(
    (sum, game) => sum + progress.games[game.id].bestStars,
    0,
  );
  const completed = gameRegistry.filter((game) => progress.games[game.id].completed).length;

  return (
    <main className="screen-shell progress-screen">
      <header className="screen-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <h1>Tiến độ</h1>
      </header>
      <div className="progress-summary">
        <strong>{totalStars} / 30 sao</strong>
        <span>{completed} / 10 bài đã hoàn thành</span>
      </div>
    </main>
  );
}
