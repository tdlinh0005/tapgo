import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { pickRound } from '../game/pickRound';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';

export const WORDS = [
  { word: 'ME', emoji: '👩' },
  { word: 'BA', emoji: '👨' },
  { word: 'CON', emoji: '👶' },
  { word: 'MEO', emoji: '🐱' },
  { word: 'CHO', emoji: '🐶' },
  { word: 'NHA', emoji: '🏠' },
  { word: 'XE', emoji: '🚗' },
  { word: 'CA', emoji: '🐟' },
  { word: 'GA', emoji: '🐔' },
  { word: 'BO', emoji: '🐄' },
  { word: 'VIT', emoji: '🦆' },
  { word: 'VOI', emoji: '🐘' },
  { word: 'CUA', emoji: '🦀' },
  { word: 'OC', emoji: '🐌' },
  { word: 'THO', emoji: '🐰' },
  { word: 'GAU', emoji: '🐻' },
  { word: 'KEM', emoji: '🍦' },
  { word: 'TAO', emoji: '🍎' },
  { word: 'NHO', emoji: '🍇' },
  { word: 'CAM', emoji: '🍊' },
  { word: 'BUT', emoji: '✏️' },
  { word: 'HOA', emoji: '🌸' },
  { word: 'SAO', emoji: '⭐' },
  { word: 'SACH', emoji: '📚' },
  { word: 'CHIM', emoji: '🐦' },
  { word: 'TRAU', emoji: '🐃' },
  { word: 'BONG', emoji: '🎈' },
  { word: 'NGUA', emoji: '🐴' },
] as const;

export default function WordTypingGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
  const { word, emoji } = pickRound(WORDS, roundIndex, sessionSeed);
  const charIndex = useKeySequence(word, onRoundComplete, onRetry);

  return (
    <section className="typing-game" aria-label="Gõ từ ngắn">
      <p className="game-prompt">Gõ từ này</p>
      <span className="typing-picture" aria-hidden="true"><Emoji char={emoji} /></span>
      <div className="typing-sequence" role="img" aria-label={word}>
        {word.split('').map((character, index) => (
          <span
            key={`${character}-${index}`}
            data-state={index < charIndex ? 'done' : index === charIndex ? 'active' : 'todo'}
            data-assist={index === charIndex ? assistLevel || undefined : undefined}
          >
            {character}
          </span>
        ))}
      </div>
      <ListenButton text={`Gõ từ ${word}`} speak={speak} />
    </section>
  );
}
