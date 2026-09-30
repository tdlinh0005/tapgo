import { useEffect, useState } from 'react';
import CoachBubble from '../components/CoachBubble';
import Confetti from '../components/Confetti';
import Mascot, { type MascotMood } from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import StarRating from '../components/StarRating';
import { useFeedbackTone } from '../hooks/useFeedbackTone';
import { useSpeech } from '../hooks/useSpeech';
import { createSessionSeed } from './pickRound';
import { DEFAULT_RETRY_HINT } from './retryCopy';
import { calculateStars } from './scoring';
import type { GameDefinition, GameId, RoundOutcome } from './types';

const GUIDES = {
  keyboard: { title: '⌨️ Dùng bàn phím', body: 'Nhìn chữ hoặc số lớn, rồi bấm đúng phím trên bàn phím.' },
  mouse: { title: '🖱️ Dùng chuột', body: 'Làm theo hình minh họa. Con có thể thử lại, không cần vội.' },
} as const;

const BURST = ['⭐', '✨', '🌟', '⭐', '✨', '🌟'];

type GameShellProps = {
  definition: GameDefinition;
  roundLimit?: number;
  onComplete: (gameId: GameId, stars: 1 | 2 | 3) => void;
  onHome: () => void;
  onNext: () => void;
  nextLabel?: string;
};

export default function GameShell({
  definition,
  roundLimit,
  onComplete,
  onHome,
  onNext,
  nextLabel = 'Bài tiếp theo',
}: GameShellProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<RoundOutcome[]>([]);
  const [stars, setStars] = useState<1 | 2 | 3 | null>(null);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'retry' | null>(null);
  const [visibleHint, setVisibleHint] = useState<string | null>(null);
  const [reviewPending, setReviewPending] = useState(false);
  const [reviewCycle, setReviewCycle] = useState(0);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const [burstKey, setBurstKey] = useState<number | null>(null);
  const [sessionSeed, setSessionSeed] = useState(createSessionSeed);
  const { speak } = useSpeech();
  const feedback = useFeedbackTone();
  const MiniGame = definition.component;
  const sessionRounds = Math.max(1, Math.min(roundLimit ?? definition.rounds, definition.rounds));
  const assistLevel: 0 | 1 | 2 = retryCount >= 3 ? 2 : retryCount >= 2 ? 1 : 0;
  const mascotMood: MascotMood = feedbackState === 'correct' ? 'cheer' : feedbackState === 'retry' || visibleHint ? 'encourage' : 'idle';
  const guideLabel = guideOpen ? 'Ẩn cách chơi' : 'Xem cách chơi';

  useEffect(() => {
    speak(definition.intro);
  }, [definition.id, definition.intro, speak]);

  const handleRoundComplete = (outcome: RoundOutcome) => {
    const completingReview = reviewPending;
    const nextOutcomes = completingReview ? outcomes : [...outcomes, outcome];
    feedback.correct();
    setFeedbackState('correct');
    setBurstKey((current) => (current ?? 0) + 1);
    setVisibleHint(null);
    setRetryCount(0);

    if (!completingReview) {
      setOutcomes(nextOutcomes);
    }

    if (outcome.attempts > outcome.correct && !completingReview && roundLimit === undefined) {
      setReviewPending(true);
      setReviewCycle((current) => current + 1);
      setReviewMessage('Mình ôn lại lượt này một lần nhé!');
      return;
    }

    setReviewPending(false);
    setReviewMessage(null);
    setGuideOpen(false);
    if (roundIndex + 1 >= sessionRounds) {
      const result = calculateStars(nextOutcomes);
      setStars(result);
      onComplete(definition.id, result);
      return;
    }

    setRoundIndex((current) => current + 1);
  };

  const handleRetry = (hint?: string) => {
    const safeHint = typeof hint === 'string' ? hint : DEFAULT_RETRY_HINT;
    const nextRetryCount = retryCount + 1;
    feedback.retry();
    setRetryCount(nextRetryCount);
    setVisibleHint(safeHint);
    setFeedbackState('retry');

    if (nextRetryCount === 2) {
      setGuideOpen(true);
      speak(safeHint);
    }
  };

  const restart = () => {
    setRoundIndex(0);
    setOutcomes([]);
    setStars(null);
    setFeedbackState(null);
    setBurstKey(null);
    setVisibleHint(null);
    setReviewPending(false);
    setReviewCycle(0);
    setReviewMessage(null);
    setRetryCount(0);
    setGuideOpen(false);
    setSessionSeed(createSessionSeed());
  };

  if (stars !== null) {
    return (
      <main className="game-shell game-result" data-category={definition.category}>
        <Confetti />
        <div className="game-result-emoji" aria-hidden="true"><Mascot mood="cheer" moving /> 🎉</div>
        <h1>Con làm xong rồi!</h1>
        <p className="result-celebration">🎉 Hoàn thành {definition.title}</p>
        <StarRating stars={stars} />
        <p className="result-label">Con nhận được {stars} sao</p>
        <div className="result-actions">
          <button className="result-primary-action" type="button" onClick={onNext}>{nextLabel}</button>
          <button type="button" onClick={restart}>Chơi lại</button>
          <button type="button" onClick={onHome}>Về nhà</button>
        </div>
      </main>
    );
  }

  return (
    <main className="game-shell" data-category={definition.category}>
      <header className="game-header">
        <button type="button" onClick={onHome} aria-label="Về nhà">🏠</button>
        <div className="game-heading">
          <span aria-hidden="true">{definition.emoji}</span>
          <h1>{definition.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => speak(definition.intro)}
          aria-label="Nghe lại cách chơi"
        >
          🔊
        </button>
      </header>

      <div className="round-status">
        <span>{roundIndex + 1} / {sessionRounds}</span>
        <ProgressBar current={roundIndex + 1} total={sessionRounds} />
      </div>

      <div className="coach-row">
        <CoachBubble
          mood={mascotMood}
          moving={feedbackState !== null}
          intro={definition.intro}
          hint={visibleHint}
          review={reviewMessage}
          guide={guideOpen ? GUIDES[definition.category] : null}
        />
        <button
          type="button"
          className="guide-toggle"
          onClick={() => setGuideOpen((open) => !open)}
          aria-expanded={guideOpen}
          aria-label={guideLabel}
          title={guideLabel}
        >
          ❓
        </button>
      </div>

      <div
        className={`game-stage${feedbackState ? ` is-${feedbackState}` : ''}`}
        data-testid="game-stage"
        data-feedback={feedbackState ?? 'idle'}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setFeedbackState(null);
        }}
      >
        <MiniGame
          key={`${roundIndex}-${reviewCycle}`}
          roundIndex={roundIndex}
          totalRounds={sessionRounds}
          onRoundComplete={handleRoundComplete}
          onRetry={handleRetry}
          speak={speak}
          assistLevel={assistLevel}
          sessionSeed={sessionSeed}
        />
        {burstKey !== null && (
          <span
            key={burstKey}
            className="stage-burst"
            data-testid="stage-burst"
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setBurstKey(null);
            }}
          >
            {BURST.map((emoji, index) => <span key={index}>{emoji}</span>)}
          </span>
        )}
      </div>
    </main>
  );
}
