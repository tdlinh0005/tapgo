import { artUrl } from '../game/art';
import type { GameDefinition } from '../game/types';

export default function GameArt({ game }: { game: Pick<GameDefinition, 'id' | 'emoji'> }) {
  const src = artUrl(game.id);
  return src ? <img className="game-art" src={src} alt="" draggable={false} /> : <>{game.emoji}</>;
}
