import type { ComponentType } from 'react';
import ListenButton from '../components/ListenButton';
import { pickRound } from '../game/pickRound';
import { spokenKeyName } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';
import type { DrillSet } from './drills';

const COMPACT_FROM_LENGTH = 11;

const SPECIAL_KEY_CELLS: Partial<Record<string, { symbol: string; dataKey: string }>> = {
  ' ': { symbol: '␣', dataKey: 'space' },
  '\n': { symbol: '⏎', dataKey: 'enter' },
};

function KeyCell({ character, state, assist }: { character: string; state: string; assist?: number }) {
  const special = SPECIAL_KEY_CELLS[character];
  return (
    <span
      data-state={state}
      data-assist={assist}
      data-key={special?.dataKey}
      role={special ? 'img' : undefined}
      aria-label={special ? spokenKeyName(character) : undefined}
    >
      {special?.symbol ?? character}
    </span>
  );
}

export function createTypingDrillGame({ title, items }: DrillSet): ComponentType<MiniGameProps> {
  return function TypingDrillGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const { text, emoji, say } = pickRound(items, roundIndex, sessionSeed);
    const charIndex = useKeySequence(text, onRoundComplete, onRetry);
    const listenText = text.endsWith('\n') ? `Gõ: ${say}, rồi bấm phím Enter` : `Gõ: ${say}`;

    return (
      <section className="typing-game" aria-label={title}>
        <p className="game-prompt">Gõ theo thứ tự</p>
        <span className="typing-picture" aria-hidden="true">{emoji}</span>
        <div className="typing-sequence" data-size={text.length >= COMPACT_FROM_LENGTH ? 'compact' : undefined}>
          {text.split('').map((character, index) => (
            <KeyCell
              key={index}
              character={character}
              state={index < charIndex ? 'done' : index === charIndex ? 'active' : 'todo'}
              assist={index === charIndex ? assistLevel || undefined : undefined}
            />
          ))}
        </div>
        <ListenButton text={listenText} speak={speak} />
      </section>
    );
  };
}
