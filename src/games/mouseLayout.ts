import { shuffleWithSeed } from '../game/pickRound';
import { SAFE_AREA } from './ClickTargetGame';

const SLOT_COLUMNS = 4;
const SLOT_ROWS = 2;

const spread = ([min, max]: readonly [number, number], steps: number) =>
  Array.from({ length: steps }, (_, index) => min + ((max - min) * index) / (steps - 1));

const SLOTS = spread(SAFE_AREA.top, SLOT_ROWS).flatMap((top) => spread(SAFE_AREA.left, SLOT_COLUMNS).map((left) => ({ left, top })));

export const MAX_CLICK_TARGETS = SLOTS.length;

/** Distinct grid slots inside the safe area, so targets never overlap. */
export function targetSlots(count: number, seed: number) {
  return shuffleWithSeed(SLOTS, seed).slice(0, count);
}

export const joinNames = (names: readonly string[]) =>
  names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} và ${names[names.length - 1]}`;
