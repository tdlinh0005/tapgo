import KeyTargetStage from '../components/KeyTargetStage';
import { pickRound } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const LETTERS = ['A', 'M', 'S', 'L', 'P', 'E', 'B', 'C', 'N', 'T', 'I', 'F', 'W', 'Z'] as const;

export default function LetterKeyGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel }: MiniGameProps) {
  const target = pickRound(LETTERS, roundIndex, sessionSeed);
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
