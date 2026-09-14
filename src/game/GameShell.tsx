import { useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import StarRating from '../components/StarRating';
import { useFeedbackTone } from '../hooks/useFeedbackTone';
import { useSpeech } from '../hooks/useSpeech';
import { calculateStars } from './scoring';
import type { GameDefinition, GameId, RoundOutcome } from './types';

type GameShellProps = {
  definition: GameDefinition;
  onComplete: (gameId: GameId, stars: 1 | 2 | 3) => void;
  onHome: () => void;
  onNext: () => void;
};

export default function GameShell({
  definition,
  onComplete,
  onHome,
  onNext,
}: GameShellProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<RoundOutcome[]>([]);
  const [stars, setStars] = useState<1 | 2 | 3 | null>(null);
  const { speak } = useSpeech();
  const feedback = useFeedbackTone();
  const MiniGame = definition.component;

  const handleRoundComplete = (outcome: RoundOutcome) => {
    const nextOutcomes = [...outcomes, outcome];
    feedback.correct();

    if (roundIndex + 1 >= definition.rounds) {
      const result = calculateStars(nextOutcomes);
      setOutcomes(nextOutcomes);
      setStars(result);
      onComplete(definition.id, result);
      return;
    }

    setOutcomes(nextOutcomes);
    setRoundIndex((current) => current + 1);
  };

  const restart = () => {
    setRoundIndex(0);
    setOutcomes([]);
    setStars(null);
  };

  if (stars !== null) {
    return (
      <main className="game-shell game-result">
        <div className="game-result-emoji" aria-hidden="true">🎉</div>
        <h1>Giỏi lắm!</h1>
        <StarRating stars={stars} />
        <p className="result-label">{stars} sao</p>
        <div className="result-actions">
          <button type="button" onClick={restart}>Chơi lại</button>
          <button type="button" onClick={onNext}>Bài tiếp theo</button>
          <button type="button" onClick={onHome}>Về nhà</button>
        </div>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <div className="game-heading">
          <span aria-hidden="true">{definition.emoji}</span>
          <h1>{definition.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => speak(definition.intro)}
          aria-label="Nghe lại hướng dẫn"
        >
          🔊
        </button>
      </header>

      <div className="round-status">
        <span>{roundIndex + 1} / {definition.rounds}</span>
        <ProgressBar current={roundIndex + 1} total={definition.rounds} />
      </div>

      <p className="game-intro">{definition.intro}</p>

      <MiniGame
        key={roundIndex}
        roundIndex={roundIndex}
        totalRounds={definition.rounds}
        onRoundComplete={handleRoundComplete}
        speak={speak}
      />
    </main>
  );
}
