import type { FunId } from '../game/types';
import type { MultiDragSet, NamedPicture, SortGroup } from './mouseDrills';

type FunMeta = { title: string; intro: string; emoji: string; rounds: number };

/** Pictures float on a scene, each carrying one key; pressing a shown key pops that picture, in any order. */
export type PopKeysSet = FunMeta & {
  kind: 'pop-keys';
  scene: string;
  keys: readonly string[];
  counts: readonly number[];
  pictures: readonly string[];
  thing: string;
  keyWord: string;
  done: string;
  prompt: string;
};
export type MemorySet = FunMeta & { kind: 'memory'; scene: string; items: readonly NamedPicture[]; pairCounts: readonly number[] };
export type PuzzlePicture = { art: string; name: string };
export type PuzzleSet = FunMeta & { kind: 'puzzle'; pictures: readonly PuzzlePicture[] };
export type FunSet = PopKeysSet | MemorySet | PuzzleSet | MultiDragSet;

const FUN_ROUNDS = 6;

export const BALLOON_KEYS = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'K', 'L', 'M', 'N', 'O', 'P', 'S', 'T', 'U', 'V', 'X', 'Y'] as const;
export const FISH_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export const MEMORY_ITEMS = [
  { emoji: '🐶', name: 'bạn cún' },
  { emoji: '🐱', name: 'bạn mèo' },
  { emoji: '🐰', name: 'bạn thỏ' },
  { emoji: '🐸', name: 'bạn ếch' },
  { emoji: '🐥', name: 'bạn gà con' },
  { emoji: '🐢', name: 'bạn rùa' },
  { emoji: '🦋', name: 'bạn bướm' },
  { emoji: '🐙', name: 'bạn bạch tuộc' },
  { emoji: '🐷', name: 'bạn heo' },
  { emoji: '🐻', name: 'bạn gấu' },
] as const satisfies readonly NamedPicture[];

export const FEED_GROUPS = [
  { id: 'rabbit', place: '🐰', label: 'Bạn thỏ', kind: 'cà rốt, rau', items: [{ emoji: '🥕', name: 'cà rốt' }, { emoji: '🥬', name: 'cây rau' }] },
  { id: 'dog', place: '🐶', label: 'Bạn cún', kind: 'xương, đùi thịt', items: [{ emoji: '🦴', name: 'khúc xương' }, { emoji: '🍖', name: 'đùi thịt' }] },
  { id: 'cat', place: '🐱', label: 'Bạn mèo', kind: 'cá, sữa', items: [{ emoji: '🐟', name: 'con cá' }, { emoji: '🥛', name: 'ly sữa' }] },
  { id: 'monkey', place: '🐒', label: 'Bạn khỉ', kind: 'chuối, dưa hấu', items: [{ emoji: '🍌', name: 'quả chuối' }, { emoji: '🍉', name: 'miếng dưa hấu' }] },
  { id: 'bear', place: '🐻', label: 'Bạn gấu', kind: 'mật ong, dâu', items: [{ emoji: '🍯', name: 'hũ mật ong' }, { emoji: '🍓', name: 'quả dâu' }] },
  { id: 'chicken', place: '🐔', label: 'Bạn gà', kind: 'ngô, thóc', items: [{ emoji: '🌽', name: 'bắp ngô' }, { emoji: '🌾', name: 'bó thóc' }] },
] as const satisfies readonly SortGroup[];

const feedById = (id: (typeof FEED_GROUPS)[number]['id']) => FEED_GROUPS.find((group) => group.id === id)!;

export const FEED_PAIRS = ([
  ['rabbit', 'dog'],
  ['cat', 'monkey'],
  ['bear', 'chicken'],
  ['rabbit', 'cat'],
  ['dog', 'bear'],
  ['monkey', 'chicken'],
] as const).map((ids) => ids.map(feedById));

export const PUZZLE_PICTURES = [
  { art: 'puzzle-1', name: 'mèo bay khí cầu' },
  { art: 'puzzle-2', name: 'gia đình khủng long đi dã ngoại' },
  { art: 'puzzle-3', name: 'tàu hoả qua cầu' },
  { art: 'puzzle-4', name: 'lâu đài cát trên bãi biển' },
  { art: 'puzzle-5', name: 'cún con bay vào vũ trụ' },
  { art: 'puzzle-6', name: 'trang trại vui vẻ' },
] as const satisfies readonly PuzzlePicture[];

export const FUN_SETS: Record<FunId, FunSet> = {
  'fun-balloon': {
    kind: 'pop-keys',
    title: 'Vui chơi 1 · Nổ bóng bay chữ',
    intro: 'Mỗi quả bóng có một chữ. Bấm đúng chữ trên bàn phím để làm nổ bóng nhé!',
    emoji: '🎈',
    rounds: FUN_ROUNDS,
    scene: 'sky',
    keys: BALLOON_KEYS,
    counts: [3, 4],
    pictures: ['🎈'],
    thing: 'Quả bóng',
    keyWord: 'chữ',
    done: '✨',
    prompt: 'Bấm chữ trên bóng để nổ bóng',
  },
  'fun-fishing': {
    kind: 'pop-keys',
    title: 'Vui chơi 2 · Câu cá số',
    intro: 'Mỗi chú cá mang một số. Bấm đúng số đó để câu cá vào xô nhé!',
    emoji: '🎣',
    rounds: FUN_ROUNDS,
    scene: 'pond',
    keys: FISH_KEYS,
    counts: [3, 4],
    pictures: ['🐟', '🐠', '🐡'],
    thing: 'Con cá',
    keyWord: 'số',
    done: '🪣',
    prompt: 'Bấm số trên cá để câu cá',
  },
  'fun-memory': {
    kind: 'memory',
    title: 'Vui chơi 3 · Lật thẻ tìm cặp',
    intro: 'Click để lật hai thẻ. Hai thẻ giống nhau là tìm được một cặp!',
    emoji: '🃏',
    rounds: FUN_ROUNDS,
    scene: 'memory',
    items: MEMORY_ITEMS,
    pairCounts: [3, 4],
  },
  'fun-feed': {
    kind: 'multi-drag',
    title: 'Vui chơi 4 · Cho thú ăn',
    intro: 'Các bạn thú đang đói bụng. Kéo món ăn tới đúng bạn thích món đó nhé!',
    emoji: '🥕',
    rounds: FUN_ROUNDS,
    items: FEED_PAIRS,
    itemCount: 4,
    prompt: 'Cho mỗi bạn món bạn thích',
    scene: 'farm',
  },
  'fun-puzzle': {
    kind: 'puzzle',
    title: 'Vui chơi 5 · Ghép tranh',
    intro: 'Kéo bốn mảnh tranh vào đúng chỗ để ghép thành bức tranh nhé!',
    emoji: '🧩',
    rounds: FUN_ROUNDS,
    pictures: PUZZLE_PICTURES,
  },
};
