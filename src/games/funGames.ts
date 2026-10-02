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
export type PianoTune = { name: string; notes: string };
/** Seven home-area keys play a toy piano; the next note of a short tune is lit. */
export type PianoSet = FunMeta & { kind: 'piano'; scene: string; tunes: readonly PianoTune[] };
export type TrainWord = { word: string; emoji: string; name: string };
/** One wagon per letter; `pools[round]` sets the word length of each round. */
export type TrainSet = FunMeta & { kind: 'train'; scene: string; pools: readonly (readonly TrainWord[])[] };
/** Moles peek out one at a time and wait to be clicked; a friend may peek too from round `friendFrom`. */
export type MoleSet = FunMeta & { kind: 'mole'; scene: string; counts: readonly number[]; friendFrom: number; friend: NamedPicture };
export type ShadowSet = FunMeta & { kind: 'shadow'; scene: string; items: readonly NamedPicture[]; counts: readonly number[] };
export type PaintColor = { id: string; name: string; fill: string };
export type PaintRegion = { name: string; color: string; d: string };
export type PaintPicture = { name: string; regions: readonly PaintRegion[]; details?: readonly string[] };
export type PaintSet = FunMeta & { kind: 'paint'; scene: string; colors: readonly PaintColor[]; pictures: readonly PaintPicture[] };
export type FunSet = PopKeysSet | MemorySet | PuzzleSet | MultiDragSet | PianoSet | TrainSet | MoleSet | ShadowSet | PaintSet;

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

/** A..J keys from C4 to B4. */
export const PIANO_NOTES = [
  { key: 'A', note: 'Đô', frequency: 262 },
  { key: 'S', note: 'Rê', frequency: 294 },
  { key: 'D', note: 'Mi', frequency: 330 },
  { key: 'F', note: 'Pha', frequency: 349 },
  { key: 'G', note: 'Son', frequency: 392 },
  { key: 'H', note: 'La', frequency: 440 },
  { key: 'J', note: 'Si', frequency: 494 },
] as const;

export const PIANO_TUNES = [
  { name: 'Ánh sao lấp lánh', notes: 'AAGGHHG' },
  { name: 'Leo cầu thang', notes: 'ASDFGH' },
  { name: 'Chú cừu nhỏ', notes: 'DSASDDD' },
  { name: 'Bài ca vui', notes: 'DDFGGFDS' },
  { name: 'Chúc mừng sinh nhật', notes: 'AASAFD' },
  { name: 'Xuống cầu thang', notes: 'HGFDSA' },
] as const satisfies readonly PianoTune[];

export const TRAIN_WORDS_2 = [
  { word: 'CA', emoji: '🐟', name: 'con cá' },
  { word: 'GA', emoji: '🐔', name: 'con gà' },
  { word: 'BO', emoji: '🐄', name: 'con bò' },
  { word: 'DE', emoji: '🐐', name: 'con dê' },
  { word: 'OC', emoji: '🐌', name: 'con ốc' },
] as const satisfies readonly TrainWord[];

export const TRAIN_WORDS_3 = [
  { word: 'MEO', emoji: '🐱', name: 'con mèo' },
  { word: 'THO', emoji: '🐰', name: 'con thỏ' },
  { word: 'HEO', emoji: '🐷', name: 'con heo' },
  { word: 'CHO', emoji: '🐶', name: 'con chó' },
  { word: 'KHI', emoji: '🐒', name: 'con khỉ' },
  { word: 'GAU', emoji: '🐻', name: 'con gấu' },
  { word: 'VOI', emoji: '🐘', name: 'con voi' },
  { word: 'NAI', emoji: '🦌', name: 'con nai' },
  { word: 'ONG', emoji: '🐝', name: 'con ong' },
  { word: 'ECH', emoji: '🐸', name: 'con ếch' },
  { word: 'CUA', emoji: '🦀', name: 'con cua' },
  { word: 'VIT', emoji: '🦆', name: 'con vịt' },
] as const satisfies readonly TrainWord[];

export const TRAIN_WORDS_4 = [
  { word: 'NGUA', emoji: '🐴', name: 'con ngựa' },
  { word: 'CHIM', emoji: '🐦', name: 'con chim' },
  { word: 'TRAU', emoji: '🐃', name: 'con trâu' },
] as const satisfies readonly TrainWord[];

export const SHADOW_ITEMS = [
  { emoji: '🐘', name: 'bạn voi' },
  { emoji: '🦒', name: 'bạn hươu cao cổ' },
  { emoji: '🐧', name: 'bạn chim cánh cụt' },
  { emoji: '🦁', name: 'bạn sư tử' },
  { emoji: '🦓', name: 'bạn ngựa vằn' },
  { emoji: '🦛', name: 'bạn hà mã' },
  { emoji: '🐢', name: 'bạn rùa' },
  { emoji: '🐰', name: 'bạn thỏ' },
  { emoji: '🦀', name: 'bạn cua' },
  { emoji: '🐌', name: 'bạn ốc sên' },
  { emoji: '🦋', name: 'bạn bướm' },
  { emoji: '🐙', name: 'bạn bạch tuộc' },
] as const satisfies readonly NamedPicture[];

export const PAINT_COLORS = [
  { id: 'red', name: 'đỏ', fill: '#ef4444' },
  { id: 'orange', name: 'cam', fill: '#fb923c' },
  { id: 'yellow', name: 'vàng', fill: '#facc15' },
  { id: 'green', name: 'xanh lá', fill: '#22c55e' },
  { id: 'blue', name: 'xanh dương', fill: '#3b82f6' },
  { id: 'purple', name: 'tím', fill: '#a855f7' },
  { id: 'brown', name: 'nâu', fill: '#a16207' },
  { id: 'black', name: 'đen', fill: '#374151' },
] as const satisfies readonly PaintColor[];

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;

/** 200x200 line drawings; regions are painted in list order, details are drawn on top. */
export const PAINT_PICTURES = [
  {
    name: 'ngôi nhà',
    regions: [
      { name: 'mái nhà', color: 'red', d: 'M25 100 L100 30 L175 100 Z' },
      { name: 'tường nhà', color: 'yellow', d: 'M40 95 H160 V180 H40 Z' },
      { name: 'cửa ra vào', color: 'brown', d: 'M85 125 H115 V180 H85 Z' },
      { name: 'cửa sổ', color: 'blue', d: 'M48 112 H72 V136 H48 Z M128 112 H152 V136 H128 Z' },
    ],
  },
  {
    name: 'bông hoa',
    regions: [
      { name: 'cành hoa', color: 'green', d: 'M95 100 H105 V188 H95 Z' },
      { name: 'chiếc lá', color: 'green', d: 'M103 160 C118 132 148 132 165 138 C152 162 125 170 103 160 Z' },
      { name: 'cánh hoa', color: 'red', d: [circle(100, 40, 26), circle(135, 75, 26), circle(100, 110, 26), circle(65, 75, 26)].join(' ') },
      { name: 'nhuỵ hoa', color: 'yellow', d: circle(100, 75, 20) },
    ],
  },
  {
    name: 'con cá',
    regions: [
      { name: 'đuôi cá', color: 'red', d: 'M140 100 L188 62 L188 138 Z' },
      { name: 'vây cá', color: 'yellow', d: 'M75 70 L105 36 L122 70 Z' },
      { name: 'thân cá', color: 'orange', d: ellipse(92, 100, 60, 40) },
    ],
    details: [circle(62, 92, 7)],
  },
  {
    name: 'cái cây',
    regions: [
      { name: 'thân cây', color: 'brown', d: 'M88 118 H112 V188 H88 Z' },
      { name: 'tán lá', color: 'green', d: circle(100, 78, 60) },
      { name: 'quả táo', color: 'red', d: [circle(72, 68, 11), circle(122, 56, 11), circle(114, 100, 11), circle(80, 106, 11)].join(' ') },
    ],
  },
  {
    name: 'chiếc ô tô',
    regions: [
      { name: 'thân xe', color: 'red', d: 'M18 112 H182 V150 H18 Z M52 112 L74 74 H132 L152 112 Z' },
      { name: 'cửa kính', color: 'blue', d: 'M80 82 H126 L140 108 H68 Z' },
      { name: 'bánh xe', color: 'black', d: [circle(58, 152, 19), circle(142, 152, 19)].join(' ') },
    ],
  },
  {
    name: 'chùm bóng bay',
    regions: [
      { name: 'bóng bên trái', color: 'purple', d: ellipse(55, 70, 30, 38) },
      { name: 'bóng bên phải', color: 'blue', d: ellipse(145, 70, 30, 38) },
      { name: 'bóng ở giữa', color: 'yellow', d: ellipse(100, 55, 30, 38) },
    ],
    details: ['M55 108 L100 185 M145 108 L100 185 M100 93 L100 185'],
  },
] as const satisfies readonly PaintPicture[];

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
  'fun-piano': {
    kind: 'piano',
    title: 'Vui chơi 6 · Đàn piano nhí',
    intro: 'Bấm phím đang sáng để đàn một bài hát nhé! Phím A S D F G H J là bảy nốt nhạc.',
    emoji: '🎹',
    rounds: FUN_ROUNDS,
    scene: 'stage',
    tunes: PIANO_TUNES,
  },
  'fun-train': {
    kind: 'train',
    title: 'Vui chơi 7 · Tàu chở chữ',
    intro: 'Mỗi toa tàu chở một chữ. Gõ lần lượt từng chữ để ghép tên bạn thú đang đi tàu nhé!',
    emoji: '🚂',
    rounds: FUN_ROUNDS,
    scene: 'rail',
    pools: [TRAIN_WORDS_2, TRAIN_WORDS_2, TRAIN_WORDS_3, TRAIN_WORDS_3, TRAIN_WORDS_3, TRAIN_WORDS_4],
  },
  'fun-mole': {
    kind: 'mole',
    title: 'Vui chơi 8 · Chuột chũi ló đầu',
    intro: 'Bạn chuột chũi ló đầu lên chơi. Click vào bạn ấy để nhận sao nhé, bạn ấy chờ con, không vội đâu!',
    emoji: '🐹',
    rounds: FUN_ROUNDS,
    scene: 'garden',
    counts: [3, 4, 4, 5, 5, 5],
    friendFrom: 2,
    friend: { emoji: '🐰', name: 'bạn thỏ' },
  },
  'fun-shadow': {
    kind: 'shadow',
    title: 'Vui chơi 9 · Tìm bóng con vật',
    intro: 'Mỗi bạn thú có một cái bóng. Kéo bạn ấy vào đúng cái bóng của mình nhé!',
    emoji: '🦒',
    rounds: FUN_ROUNDS,
    scene: 'shadow',
    items: SHADOW_ITEMS,
    counts: [3, 3, 3, 4, 4, 4],
  },
  'fun-paint': {
    kind: 'paint',
    title: 'Vui chơi 10 · Tô màu tranh',
    intro: 'Click chọn một màu, rồi click vào tranh để tô giống hình mẫu nhé!',
    emoji: '🎨',
    rounds: FUN_ROUNDS,
    scene: 'paint',
    colors: PAINT_COLORS,
    pictures: PAINT_PICTURES,
  },
};
