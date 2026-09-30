import PathStation from '../components/PathStation';
import { getRecommendedGameId, isPathUnlocked, PATH_ORDER } from '../game/path';
import type { ProgressState } from '../game/progress';
import { getGameDefinition } from '../game/registry';
import type { GameId } from '../game/types';

type Props = {
  progress: ProgressState;
  onPlay: (gameId: GameId) => void;
  onHome: () => void;
};

const PATH_WIDTH = 1000;
const PATH_HEIGHT = 420;
const STATIONS_PER_ROW = 5;

/** Snakes the stations left-to-right then right-to-left, lifting every other column for the zigzag. */
function stationPoint(index: number) {
  const row = Math.floor(index / STATIONS_PER_ROW);
  const column = index % STATIONS_PER_ROW;
  const slot = row % 2 === 0 ? column : STATIONS_PER_ROW - 1 - column;
  return { x: 100 + slot * 200, y: 60 + row * 240 + (slot % 2) * 60 };
}

function toPoints(indexes: number[]) {
  return indexes.map((index) => {
    const { x, y } = stationPoint(index);
    return `${x},${y}`;
  }).join(' ');
}

export default function LearningPathScreen({ progress, onPlay, onHome }: Props) {
  const recommendedId = getRecommendedGameId(progress);
  const indexes = PATH_ORDER.map((_, index) => index);
  const reached = PATH_ORDER.filter((gameId) => isPathUnlocked(gameId, progress)).length;

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <h1>Lộ trình học</h1>
      </header>
      <p>Đi từ bài dễ đến khó. Bé vẫn có thể chơi mọi bài trong Chơi tự do.</p>
      <div className="learning-path">
        <svg className="path-road" viewBox={`0 0 ${PATH_WIDTH} ${PATH_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
          <polyline className="path-road-base" points={toPoints(indexes)} />
          {reached > 1 && <polyline className="path-road-reached" points={toPoints(indexes.slice(0, reached))} />}
          <polyline className="path-road-dashes" points={toPoints(indexes)} />
        </svg>
        <ol className="path-stations">
          {PATH_ORDER.map((gameId, index) => {
            const game = getGameDefinition(gameId);
            const { x, y } = stationPoint(index);
            const record = progress.games[gameId];
            return (
              <PathStation
                key={gameId}
                game={game}
                step={index + 1}
                stars={record.bestStars}
                completed={record.completed}
                locked={!isPathUnlocked(gameId, progress)}
                recommended={gameId === recommendedId}
                style={{ left: `${(x / PATH_WIDTH) * 100}%`, top: `${(y / PATH_HEIGHT) * 100}%` }}
                onPlay={() => onPlay(gameId)}
              />
            );
          })}
        </ol>
      </div>
    </main>
  );
}
