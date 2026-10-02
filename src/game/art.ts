const ART_URLS = import.meta.glob<string>('../assets/art/**/*.webp', { eager: true, import: 'default' });

/** Bundled illustration URL for a game id or `mascot-<mood>`; undefined when none was drawn, so callers fall back to the emoji. */
export function artUrl(name: string): string | undefined {
  return ART_URLS[`../assets/art/${name}.webp`];
}

/** File name of an in-play picture: `e-` plus the emoji's code points in hex, variation selector dropped (⭐ → `e-2b50`, ☁️ → `e-2601`). */
export function emojiArtName(emoji: string): string {
  const codePoints = [...emoji].map((char) => char.codePointAt(0) ?? 0).filter((code) => code !== 0xfe0f);
  return `e-${codePoints.map((code) => code.toString(16)).join('-')}`;
}

export function emojiArtUrl(emoji: string): string | undefined {
  return artUrl(`play/${emojiArtName(emoji)}`);
}
