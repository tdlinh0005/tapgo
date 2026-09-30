import KeyTargetStage from '../components/KeyTargetStage';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const LETTERS = ['A', 'M', 'S', 'L', 'P', 'E', 'B', 'C', 'N', 'T'] as const;

export default function LetterKeyGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel }: MiniGameProps) {
  const target = LETTERS[roundIndex % LETTERS.length];
  useKeySequence(target, onRoundComplete, onRetry);

  return (
    <KeyTargetStage
      label="Gõ chữ cái"
      prompt="Bấm chữ này"
      target={target}
      targetLabel={`Chữ ${target}`}
      listenText={`Bấm chữ ${target}`}
      speak={speak}
      assistLevel={assistLevel}
    />
  );
}
