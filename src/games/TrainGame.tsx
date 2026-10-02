import type { ComponentType } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { useKeySequence } from '../hooks/useKeySequence';
import type { TrainSet } from './funGames';

const WAGON = artUrl('play/wagon');
const wagonHint = (letter: string) => `${RETRY_PREFIX} Gõ chữ ${letter} trên toa đang sáng nhé.`;

export function createTrainGame({ title, scene, pools }: TrainSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function TrainGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const target = pickRound(pools[roundIndex % pools.length], roundIndex, sessionSeed);
    const letters = target.word.split('');
    const typed = useKeySequence(target.word, onRoundComplete, onRetry, wagonHint);

    return (
      <>
        <p className="game-prompt">Gõ tên {target.name}</p>
        <ListenButton text={`Gõ tên ${target.name}: ${letters.join(', ')}`} speak={speak} />
        <section className="click-play-area train-area" data-testid="play-area" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          <div className="train">
            <span className="train-engine" aria-hidden="true"><Emoji char="🚂" /></span>
            {letters.map((letter, index) => (
              <div
                key={index}
                className="train-wagon"
                data-state={index < typed ? 'done' : index === typed ? 'next' : undefined}
                data-assist={index === typed ? assistLevel || undefined : undefined}
                role="img"
                aria-label={index < typed ? `Toa chữ ${letter} đã gõ` : `Toa chữ ${letter}`}
                style={WAGON ? { backgroundImage: `url(${WAGON})` } : undefined}
              >
                <span className="train-letter" aria-hidden="true">{letter}</span>
              </div>
            ))}
            <span className="train-rider" role="img" aria-label={target.name}><Emoji char={target.emoji} /></span>
          </div>
        </section>
      </>
    );
  };
}
