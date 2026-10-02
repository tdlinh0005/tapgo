import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { pickRound } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

// Indexed by level: 3, 4, then 5 keys per sequence.
export const SEQUENCES_BY_LEVEL = [
  ['ASD', 'JKL', 'FGH', 'QWE', 'GHJ', 'UIO', 'ZXC', 'VBN', 'DFG', 'RTY', 'BNM', 'WER'],
  ['ASDF', 'JKLM', 'RTYU', 'ZXCV', 'UIOP', 'WERT', 'HJKL', 'QWER', 'SDFG', 'XCVB', 'TYUI', 'FGHJ'],
  ['ASDFG', 'QWERT', 'YUIOP', 'ZXCVB', 'HJKLM', 'SDFGH', 'ERTYU', 'CVBNM', 'GHJKL', 'TYUIO', 'WERTY', 'XCVBN'],
] as const;

export const SEQUENCES = SEQUENCES_BY_LEVEL.flat();

const ROW_PICTURES = [
  { keys: 'QWERTYUIOP', emoji: '🚂' },
  { keys: 'ASDFGHJKL', emoji: '🐾' },
  { keys: 'ZXCVBNM', emoji: '🐛' },
] as const;

// A sequence on one keyboard row gets that row's picture (home row = paw steps).
export function sequencePicture(sequence: string): string {
  return ROW_PICTURES.find(({ keys }) => sequence.split('').every((key) => keys.includes(key)))?.emoji ?? '🌈';
}

export default function SequenceTypingGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0, level = 0 }: MiniGameProps) {
  const sequence = pickRound(SEQUENCES_BY_LEVEL[level], roundIndex, sessionSeed);
  const keyIndex = useKeySequence(sequence, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Gõ chuỗi phím">
      <p className="game-prompt">Gõ theo thứ tự</p>
      <span className="typing-picture" aria-hidden="true"><Emoji char={sequencePicture(sequence)} /></span>
      <div className="typing-sequence">
        {sequence.split('').map((character, index) => (
          <span
            key={`${character}-${index}`}
            data-state={index < keyIndex ? 'done' : index === keyIndex ? 'active' : 'todo'}
            data-assist={index === keyIndex ? assistLevel || undefined : undefined}
          >
            {character}
          </span>
        ))}
      </div>
      <ListenButton text={`Gõ theo thứ tự ${sequence.split('').join(' ')}`} speak={speak} />
    </section>
  );
}
