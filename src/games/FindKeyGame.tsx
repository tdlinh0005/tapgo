import KeyTargetStage from '../components/KeyTargetStage';
import { pickRound } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const TARGETS = ['Q', 'G', 'H', 'K', 'R', 'U', 'V', 'Y', 'D', 'O', 'J', 'X'] as const;

export default function FindKeyGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel }: MiniGameProps) {
  const target = pickRound(TARGETS, roundIndex, sessionSeed);
  const instruction = `Hãy bấm chữ ${target}`;
  useKeySequence(target, onRoundComplete, onRetry);

  return (
    <KeyTargetStage
      label="Tìm phím đúng"
      prompt={instruction}
      target={target}
      listenText={instruction}
      speak={speak}
      assistLevel={assistLevel}
    />
  );
}
