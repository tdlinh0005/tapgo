import { useRef, useState, type ComponentType } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { roundSeed, shuffleWithSeed } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { MemorySet } from './funGames';

const CARD_BACK = artUrl('play/card-back');

/** A mismatch is free while the child is still exploring: only mismatches beyond the number of pairs count as misses. */
export const memoryOutcome = (pairs: number, mismatches: number) => ({ correct: pairs, attempts: pairs + Math.max(0, mismatches - pairs) });

export function createMemoryGame({ title, scene, items, pairCounts }: MemorySet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function MemoryGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const pairs = pairCounts[roundIndex % pairCounts.length];
    const seed = roundSeed(roundIndex, sessionSeed);
    const pictures = shuffleWithSeed(items, seed).slice(0, pairs);
    const cards = shuffleWithSeed([...pictures, ...pictures], seed + 1);
    const [open, setOpen] = useState<readonly number[]>([]);
    const [matched, setMatched] = useState<readonly string[]>([]);
    const mismatches = useRef(0);

    const partnerOf = (index: number) => cards.findIndex((card, at) => at !== index && card.emoji === cards[index].emoji);
    const nextIndex = open.length > 0 ? partnerOf(open[0]) : cards.findIndex((card) => !matched.includes(card.emoji));

    const flip = (index: number) => {
      const current = open.length === 2 ? [] : open;
      if (matched.includes(cards[index].emoji) || current.includes(index)) {
        setOpen(current);
        return;
      }
      const next = [...current, index];
      if (next.length < 2) {
        setOpen(next);
        return;
      }
      if (cards[next[0]].emoji === cards[index].emoji) {
        const nextMatched = [...matched, cards[index].emoji];
        if (nextMatched.length === pairs) {
          onRoundComplete(memoryOutcome(pairs, mismatches.current));
          return;
        }
        setMatched(nextMatched);
        setOpen([]);
        return;
      }
      mismatches.current += 1;
      if (mismatches.current > pairs) onRetry?.(`${RETRY_PREFIX} Nhớ chỗ các hình đã lật nhé.`);
      setOpen(next);
    };

    return (
      <>
        <p className="game-prompt">Lật thẻ tìm {pairs} cặp giống nhau</p>
        <ListenButton text={`Click để lật hai thẻ. Tìm ${pairs} cặp hình giống nhau nhé`} speak={speak} />
        <section className="click-play-area memory-board" data-scene={scene} data-cards={cards.length} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          {cards.map((card, index) => {
            const state = matched.includes(card.emoji) ? 'matched' : open.includes(index) ? 'up' : undefined;
            return (
              <button
                key={index}
                type="button"
                className="memory-card"
                data-state={state}
                data-assist={index === nextIndex ? assistLevel || undefined : undefined}
                aria-label={state ? `Thẻ ${index + 1}: ${card.name}` : `Thẻ ${index + 1}`}
                onClick={() => flip(index)}
              >
                {state
                  ? <span className="memory-face" aria-hidden="true"><Emoji char={card.emoji} /></span>
                  : CARD_BACK ? <img className="memory-back" src={CARD_BACK} alt="" /> : <span className="memory-face" aria-hidden="true">⭐</span>}
              </button>
            );
          })}
        </section>
      </>
    );
  };
}
