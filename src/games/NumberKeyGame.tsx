import KeyTargetStage from '../components/KeyTargetStage';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

const NUMBERS = ['1', '5', '9', '2', '8', '3', '7', '4', '6', '0'] as const;

export default function NumberKeyGame({ roundIndex, onRoundComplete, onRetry, speak, assistLevel }: MiniGameProps) {
  const target = NUMBERS[roundIndex % NUMBERS.length];
  useKeySequence(target, onRoundComplete, onRetry);

  return (
    <KeyTargetStage
      label="Gõ số"
      prompt="Bấm số này"
      target={target}
      targetLabel={`Số ${target}`}
      listenText={`Bấm số ${target}`}
      speak={speak}
      assistLevel={assistLevel}
    />
  );
}
