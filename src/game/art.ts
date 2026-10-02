const ART_URLS = import.meta.glob<string>('../assets/art/*.webp', { eager: true, import: 'default' });

/** Bundled illustration URL for a game id or `mascot-<mood>`; undefined when none was drawn, so callers fall back to the emoji. */
export function artUrl(name: string): string | undefined {
  return ART_URLS[`../assets/art/${name}.webp`];
}
