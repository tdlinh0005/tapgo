import { emojiArtUrl } from '../game/art';

/** An in-play picture: the drawing for this emoji when one exists, else the emoji itself. Sized in em, so it follows the font size its slot already sets; alt keeps the emoji so a button named only by its picture keeps that name. */
export default function Emoji({ char }: { char: string }) {
  const src = emojiArtUrl(char);
  return src ? <img className="emoji-art" src={src} alt={char} data-emoji={char} draggable={false} /> : <>{char}</>;
}
