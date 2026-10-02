import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { SearchSet } from './funGames';

export const CLICK_BOX_HINT = `${RETRY_PREFIX} Click vào ô tìm kiếm trước nhé.`;

/** Accents, đ and extra spaces do not matter: "mèo  con" finds MEO CON. */
export const normalizeSearch = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'D').toUpperCase().replace(/\s+/g, ' ').trim();

export function createSearchBoxGame({ title, scene, pools }: SearchSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function SearchBoxGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const target = pickRound(pools[roundIndex % pools.length], roundIndex, sessionSeed);
    const [value, setValue] = useState('');
    const [focused, setFocused] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const misses = useRef(0);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
        if (document.activeElement === input.current) return;
        event.preventDefault();
        misses.current += 1;
        onRetry?.(CLICK_BOX_HINT);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onRetry]);

    const handleEnter = (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (normalizeSearch(value) === target.word) {
        const correct = target.word.length + 1;
        onRoundComplete({ correct, attempts: correct + misses.current });
        return;
      }
      misses.current += 1;
      onRetry?.(value.trim() ? `${RETRY_PREFIX} Chưa đúng. Gõ ${target.word} rồi bấm Enter nhé.` : `${RETRY_PREFIX} Gõ tên ${target.word} trước rồi mới bấm Enter nhé.`);
    };

    return (
      <>
        <p className="game-prompt">{focused ? <>Gõ {target.word} rồi bấm Enter</> : 'Click vào ô tìm kiếm'}</p>
        <ListenButton text={`Click vào ô tìm kiếm, gõ ${target.word.split('').join(', ')}, rồi bấm phím Enter để tìm ${target.name}`} speak={speak} />
        <section className="click-play-area search-area" data-testid="play-area" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          <p className="search-card" aria-label={`Tìm ${target.name}: ${target.word}`}>
            <Emoji char={target.emoji} />
            <span aria-hidden="true">{target.word}</span>
          </p>
          <form className="search-bar" role="search" data-focused={focused || undefined} onSubmit={(event) => event.preventDefault()}>
            <span className="search-icon" aria-hidden="true"><Emoji char="🔍" /></span>
            <input
              ref={input}
              className="search-input"
              type="text"
              value={value}
              placeholder="Tìm kiếm..."
              aria-label="Ô tìm kiếm"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-assist={assistLevel || undefined}
              onChange={(event) => setValue(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleEnter}
            />
          </form>
        </section>
      </>
    );
  };
}
