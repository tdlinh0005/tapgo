import { useEffect, useRef, useState, type ComponentType } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound, roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { ERASER_WRONG_LETTERS, type EraserSet } from './funGames';

export const BACKSPACE_HINT = `${RETRY_PREFIX} Bấm phím Backspace ← để xoá chữ sai nhé.`;

/** What the box holds when the round opens: the word (minus its last `wrongCount` letters on a retype round) plus that many wrong letters. */
export function eraserStart(word: string, wrongCount: number, retype: boolean, seed: number): string {
  const wrong = shuffleWithSeed(ERASER_WRONG_LETTERS.filter((letter) => !word.includes(letter)), seed).slice(0, wrongCount).join('');
  return (retype ? word.slice(0, word.length - wrongCount) : word) + wrong;
}

const rightLength = (text: string, word: string) => {
  let length = 0;
  while (length < text.length && text[length] === word[length]) length += 1;
  return length;
};

export function createEraserGame({ title, scene, pools, wrongCounts, retype }: EraserSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function EraserGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const round = roundIndex % pools.length;
    const target = pickRound(pools[round], roundIndex, sessionSeed);
    const wrongCount = wrongCounts[round];
    const retypes = retype[round];
    const [text, setText] = useState(() => eraserStart(target.word, wrongCount, retypes, roundSeed(roundIndex, sessionSeed)));
    const misses = useRef(0);
    const right = rightLength(text, target.word);
    const hasWrong = right < text.length;
    const nextLetter = target.word[text.length];

    useEffect(() => {
      const miss = (hint: string) => {
        misses.current += 1;
        onRetry?.(hint);
      };
      const update = (next: string) => {
        if (next !== target.word) {
          setText(next);
          return;
        }
        const correct = wrongCount * (retypes ? 2 : 1);
        onRoundComplete({ correct, attempts: correct + misses.current });
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        if (event.key === 'Backspace') {
          event.preventDefault();
          if (hasWrong) update(text.slice(0, -1));
          else miss(`${RETRY_PREFIX} Các chữ còn lại đều đúng rồi. Gõ chữ ${nextLetter} nhé.`);
          return;
        }
        if (event.key.length !== 1) return;
        event.preventDefault();
        if (event.key === ' ') return;
        if (hasWrong) miss(BACKSPACE_HINT);
        else if (event.key.toUpperCase() !== nextLetter) miss(`${RETRY_PREFIX} Gõ chữ ${nextLetter} nhé.`);
        else update(text + nextLetter);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [text, hasWrong, nextLetter, target.word, wrongCount, retypes, onRoundComplete, onRetry]);

    const letters = target.word.split('');
    const listen = `Bấm phím Backspace để xoá chữ sai màu đỏ${retypes ? ', rồi gõ lại' : ''} cho đúng tên ${target.name}: ${letters.join(', ')}`;

    return (
      <>
        <p className="game-prompt">Sửa tên {target.name} <Emoji char={target.emoji} /></p>
        <ListenButton text={listen} speak={speak} />
        <section className="click-play-area eraser-area" data-testid="play-area" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          <p className="eraser-model" aria-label={`Tên đúng: ${target.word}`}>
            <Emoji char={target.emoji} />
            <span aria-hidden="true">{target.word}</span>
          </p>
          <output className="eraser-box" aria-label={`Ô chữ đang có: ${text.split('').join(' ')}`}>
            {text.split('').map((letter, index) => (
              <span key={index} className="eraser-letter" data-state={index < right ? undefined : 'wrong'} aria-hidden="true">{letter}</span>
            ))}
            <span className="eraser-caret" aria-hidden="true" />
          </output>
          <span className="eraser-key" data-key={hasWrong ? 'backspace' : 'letter'} data-assist={assistLevel || undefined} role="img" aria-label={hasWrong ? 'Bấm phím Backspace' : `Bấm phím ${nextLetter}`}>
            {hasWrong ? '← Backspace' : nextLetter}
          </span>
        </section>
      </>
    );
  };
}
