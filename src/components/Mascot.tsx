import { artUrl } from '../game/art';

export type MascotMood = 'idle' | 'cheer' | 'encourage';

const FACES: Record<MascotMood, string> = { idle: '🐱', cheer: '😸', encourage: '😺' };

type MascotProps = {
  mood: MascotMood;
  /** Plays the mood animation; toggling it off and on replays it for a repeated mood. */
  moving?: boolean;
};

export default function Mascot({ mood, moving = false }: MascotProps) {
  const src = artUrl(`mascot-${mood}`);
  return (
    <span className="mascot" data-mood={mood} data-moving={moving || undefined} aria-hidden="true">
      {src ? <img className="mascot-art" src={src} alt="" draggable={false} /> : FACES[mood]}
    </span>
  );
}
