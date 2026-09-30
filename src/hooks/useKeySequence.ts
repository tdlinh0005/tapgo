import { useEffect, useRef, useState } from 'react';
import { keyRetryHint } from '../game/retryCopy';
import type { RoundOutcome } from '../game/types';

/**
 * Listens for the keys of `sequence` in order on the physical keyboard.
 * Returns the index of the next expected key. A single key is a sequence of length 1.
 */
export function useKeySequence(
  sequence: string,
  onRoundComplete: (outcome: RoundOutcome) => void,
  onRetry?: (hint?: string) => void,
  hintFor: (key: string) => string = keyRetryHint,
): number {
  const [index, setIndex] = useState(0);
  const attempts = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
      event.preventDefault();
      const expected = sequence[index];
      if (event.key === ' ' && expected !== ' ') return;

      attempts.current += 1;
      if (event.key.toUpperCase() !== expected.toUpperCase()) {
        onRetry?.(hintFor(expected));
        return;
      }

      const nextIndex = index + 1;
      if (nextIndex >= sequence.length) {
        onRoundComplete({ correct: sequence.length, attempts: attempts.current });
      } else {
        setIndex(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, sequence, onRoundComplete, onRetry, hintFor]);

  return index;
}
