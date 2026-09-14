import { useState } from 'react';
import DesktopGate from './components/DesktopGate';
import GameShell from './game/GameShell';
import { gameRegistry, getGameDefinition } from './game/registry';
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

type AppView =
  | { name: 'home' }
  | { name: 'path' }
  | { name: 'free-play' }
  | { name: 'progress' }
  | { name: 'game'; gameId: GameId };

export default function App() {
  const [view, setView] = useState<AppView>({ name: 'home' });
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const openGame = (gameId: GameId) => setView({ name: 'game', gameId });
  const goHome = () => setView({ name: 'home' });

  const handleComplete = (gameId: GameId, stars: 1 | 2 | 3) => {
    setProgress((current) => {
      const next = recordCompletion(current, gameId, stars);
      saveProgress(next);
      return next;
    });
  };

  const openNext = (gameId: GameId) => {
    const index = gameRegistry.findIndex((game) => game.id === gameId);
    const next = gameRegistry[index + 1];
    if (next) {
      openGame(next.id);
    } else {
      setView({ name: 'progress' });
    }
  };

  let content;
  if (view.name === 'path') {
    content = <LearningPathScreen progress={progress} onPlay={openGame} onHome={goHome} />;
  } else if (view.name === 'free-play') {
    content = <FreePlayScreen progress={progress} onPlay={openGame} onHome={goHome} />;
  } else if (view.name === 'progress') {
    content = <ProgressScreen progress={progress} onHome={goHome} />;
  } else if (view.name === 'game') {
    const definition = getGameDefinition(view.gameId);
    content = definition ? (
      <GameShell
        definition={definition}
        onComplete={handleComplete}
        onHome={goHome}
        onNext={() => openNext(view.gameId)}
      />
    ) : (
      <main className="screen-shell">
        <h1>Không tìm thấy bài học</h1>
        <button type="button" onClick={goHome}>Về nhà</button>
      </main>
    );
  } else {
    content = (
      <HomeScreen
        onPath={() => setView({ name: 'path' })}
        onFreePlay={() => setView({ name: 'free-play' })}
        onProgress={() => setView({ name: 'progress' })}
      />
    );
  }

  return <DesktopGate>{content}</DesktopGate>;
}
