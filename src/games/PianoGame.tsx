import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import { playNote } from '../hooks/useFeedbackTone';
import { PIANO_NOTES, type PianoSet } from './funGames';

const KEY_HUE_STEP_DEG = 45;

export function createPianoGame({ title, scene, tunes }: PianoSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function PianoGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const tune = pickRound(tunes, roundIndex, sessionSeed);
    const notes = tune.notes.split('');
    const [played, setPlayed] = useState(0);
    const [lastKey, setLastKey] = useState<string | null>(null);
    const misses = useRef(0);
    const nextKey = notes[played];

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
        if (event.key === ' ') {
          event.preventDefault();
          return;
        }
        const key = event.key.toUpperCase();
        const note = PIANO_NOTES.find((entry) => entry.key === key);
        if (!note) {
          misses.current += 1;
          onRetry?.(`${RETRY_PREFIX} Bấm phím ${nextKey} đang sáng nhé.`);
          return;
        }
        playNote(note.frequency);
        if (key !== nextKey) return;
        if (played + 1 === notes.length) {
          onRoundComplete({ correct: notes.length, attempts: notes.length + misses.current });
          return;
        }
        setPlayed(played + 1);
        setLastKey(key);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [played, nextKey, notes.length, onRoundComplete, onRetry]);

    return (
      <>
        <p className="game-prompt">Đàn bài: {tune.name}</p>
        <ListenButton text={`Đàn bài ${tune.name}. Bấm phím đang sáng nhé`} speak={speak} />
        <section className="click-play-area piano-stage" data-testid="play-area" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          <ol className="piano-tune" aria-label={`Đã đàn ${played} / ${notes.length} nốt`}>
            {notes.map((key, index) => (
              <li key={index} data-state={index < played ? 'played' : index === played ? 'next' : undefined}>{key}</li>
            ))}
          </ol>
          <div className="piano-keys">
            {PIANO_NOTES.map(({ key, note }, index) => (
              <div
                key={key}
                className="piano-key"
                data-state={key === nextKey ? 'next' : undefined}
                data-assist={key === nextKey ? assistLevel || undefined : undefined}
                role="img"
                aria-label={key === nextKey ? `Phím ${key} nốt ${note}, bấm phím này` : `Phím ${key} nốt ${note}`}
                style={{ '--key-hue': `${index * KEY_HUE_STEP_DEG}deg` } as CSSProperties}
              >
                {key === lastKey && <span key={played} className="piano-note" aria-hidden="true"><Emoji char="🎵" /></span>}
                <span className="piano-key-letter">{key}</span>
                <span className="piano-key-note">{note}</span>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };
}
