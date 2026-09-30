import KeyTargetStage from '../components/KeyTargetStage';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const TARGETS = ['Q', 'G', 'H', 'K', 'R', 'U', 'V', 'Y', 'D', 'O'] as const;

export default function FindKeyGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel }: MiniGameProps) {
  const target = TARGETS[roundIndex % TARGETS.length];
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
