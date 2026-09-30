import { useEffect, useRef } from 'react';
import type { RoundOutcome } from '../game/types';

export function useExpectedKey(
  expectedKey: string,
  onRoundComplete: (outcome: RoundOutcome) => void,
  onRetry?: (hint?: string) => void,
): void {
  const attempts = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;

      attempts.current += 1;
      if (event.key.toUpperCase() === expectedKey.toUpperCase()) {
        onRoundComplete({ correct: 1, attempts: attempts.current });
      } else {
        onRetry?.(`Hãy tìm phím ${expectedKey} trên bàn phím nhé.`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expectedKey, onRoundComplete, onRetry]);
}
