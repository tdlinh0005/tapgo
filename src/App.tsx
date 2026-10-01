import { useEffect, useState } from 'react';
import BackgroundDecor from './components/BackgroundDecor';
import DesktopGate from './components/DesktopGate';
import GameShell from './game/GameShell';
import { getNextGameId, getRecommendedGameId } from './game/path';
import { getGameDefinition } from './game/registry';
import {
  loadProgress,
  recordCompletion,
  saveProgress,
  type ProgressState,
} from './game/progress';
import type { GameId } from './game/types';
import FreePlayScreen from './screens/FreePlayScreen';
import HomeScreen from './screens/HomeScreen';
import LearningPathScreen from './screens/LearningPathScreen';
import ProgressScreen from './screens/ProgressScreen';

type GameMode = 'guided' | 'path' | 'free-play';

type AppView =
  | { name: 'home' }
  | { name: 'path' }
  | { name: 'free-play' }
  | { name: 'progress' }
  | { name: 'game'; gameId: GameId; mode: GameMode };

export default function App() {
  const [view, setView] = useState<AppView>({ name: 'home' });
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const openGame = (gameId: GameId, mode: GameMode) => setView({ name: 'game', gameId, mode });
  const goHome = () => setView({ name: 'home' });
  const startGuidedPlay = () => openGame(getRecommendedGameId(progress), 'guided');

  const handleComplete = (gameId: GameId, stars: 1 | 2 | 3) => {
    setProgress((current) => recordCompletion(current, gameId, stars));
  };

  const getFollowingGameId = (gameId: GameId, mode: GameMode) =>
    mode === 'guided' ? getRecommendedGameId(progress, gameId) : getNextGameId(gameId);

  const openNext = (gameId: GameId, mode: GameMode) => {
    const nextGameId = getFollowingGameId(gameId, mode);
    if (nextGameId) {
      openGame(nextGameId, mode);
    } else {
      setView({ name: 'progress' });
    }
  };

  let content;
  if (view.name === 'path') {
    content = <LearningPathScreen progress={progress} onPlay={(gameId) => openGame(gameId, 'path')} onHome={goHome} />;
  } else if (view.name === 'free-play') {
    content = <FreePlayScreen progress={progress} onPlay={(gameId) => openGame(gameId, 'free-play')} onHome={goHome} />;
  } else if (view.name === 'progress') {
    content = <ProgressScreen progress={progress} onPlay={(gameId) => openGame(gameId, 'guided')} onHome={goHome} />;
  } else if (view.name === 'game') {
    content = (
      <GameShell
        key={`${view.mode}-${view.gameId}`}
        definition={getGameDefinition(view.gameId)}
        roundLimit={view.mode === 'guided' ? 5 : undefined}
        bestStars={progress.games[view.gameId].bestStars}
        onComplete={handleComplete}
        onHome={goHome}
        onNext={() => openNext(view.gameId, view.mode)}
        nextLabel={getFollowingGameId(view.gameId, view.mode) ? 'Bài tiếp theo' : 'Xem tiến độ'}
      />
    );
  } else {
    content = (
      <HomeScreen
        onGuidedPlay={startGuidedPlay}
        onPath={() => setView({ name: 'path' })}
        onFreePlay={() => setView({ name: 'free-play' })}
        onProgress={() => setView({ name: 'progress' })}
      />
    );
  }

  return (
    <>
      <BackgroundDecor />
      <DesktopGate>{content}</DesktopGate>
    </>
  );
}
