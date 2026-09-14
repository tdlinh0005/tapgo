import type { RoundOutcome } from './types';

export function calculateStars(outcomes: RoundOutcome[]): 1 | 2 | 3 {
  const correct = outcomes.reduce((sum, item) => sum + item.correct, 0);
  const attempts = outcomes.reduce((sum, item) => sum + item.attempts, 0);
  const accuracy = attempts === 0 ? 0 : correct / attempts;

  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.75) return 2;
  return 1;
}
