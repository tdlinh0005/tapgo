import KeyTargetStage from '../components/KeyTargetStage';
import { shuffleWithSeed } from '../game/pickRound';
import { spokenKeyName } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const SPACE_ENTER_KEYS = {
  ' ': { label: 'Space', emoji: '🚀' },
  '\n': { label: 'Enter', emoji: '📮' },
} as const;

type SpaceEnterKey = keyof typeof SPACE_ENTER_KEYS;

// Half Space, half Enter, so a full session always practises both keys.
export const SPACE_ENTER_ROUNDS: readonly SpaceEnterKey[] = [' ', '\n', ' ', '\n', ' ', '\n', ' ', '\n', ' ', '\n'];

export function spaceEnterKey(roundIndex: number, sessionSeed?: number): SpaceEnterKey {
  const rounds = sessionSeed === undefined ? SPACE_ENTER_ROUNDS : shuffleWithSeed(SPACE_ENTER_ROUNDS, sessionSeed);
  return rounds[roundIndex % rounds.length];
}

export default function SpaceEnterGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel }: MiniGameProps) {
  const key = spaceEnterKey(roundIndex, sessionSeed);
  const { label, emoji } = SPACE_ENTER_KEYS[key];
  const name = spokenKeyName(key);
  useKeySequence(key, onRoundComplete, onRetry);

  return (
    <KeyTargetStage
      label="Phím cách và Enter"
      prompt={`Bấm ${name}`}
      target={`${emoji} ${label}`}
      targetLabel={`Phím ${label}`}
      listenText={`Bấm ${name}`}
      speak={speak}
      assistLevel={assistLevel}
      shape={key === ' ' ? 'wide' : undefined}
    />
  );
}
