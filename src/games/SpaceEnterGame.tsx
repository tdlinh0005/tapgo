import KeyTargetStage from '../components/KeyTargetStage';
import { shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const SPACE_ENTER_KEYS = {
  ' ': { label: 'Space', emoji: '🚀', name: 'phím cách' },
  '\n': { label: 'Enter', emoji: '📮', name: 'phím Enter' },
} as const;

type SpaceEnterKey = keyof typeof SPACE_ENTER_KEYS;

// Half Space, half Enter, so a full session always practises both keys.
export const SPACE_ENTER_ROUNDS: readonly SpaceEnterKey[] = [' ', '\n', ' ', '\n', ' ', '\n', ' ', '\n', ' ', '\n'];

export function spaceEnterKey(roundIndex: number, sessionSeed?: number): SpaceEnterKey {
  const rounds = sessionSeed === undefined ? SPACE_ENTER_ROUNDS : shuffleWithSeed(SPACE_ENTER_ROUNDS, sessionSeed);
  return rounds[roundIndex % rounds.length];
}

const hintFor = (key: string) => `${RETRY_PREFIX} Tìm ${SPACE_ENTER_KEYS[key as SpaceEnterKey].name} trên bàn phím nhé.`;

export default function SpaceEnterGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel }: MiniGameProps) {
  const key = spaceEnterKey(roundIndex, sessionSeed);
  const { label, emoji, name } = SPACE_ENTER_KEYS[key];
  useKeySequence(key, onRoundComplete, onRetry, hintFor);

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
