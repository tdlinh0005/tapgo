import type { MouseDrillId } from '../game/types';
import { CLICK_TARGETS } from './ClickTargetGame';
import { TRAILS } from './MouseTrailGame';

export type NamedPicture = { emoji: string; name: string };
export type TargetSize = 'medium' | 'small';
export type Trail = readonly (readonly [number, number])[];
export type SortGroup = { id: string; place: string; label: string; kind: string; items: readonly NamedPicture[] };

type MouseDrillMeta = { title: string; intro: string; emoji: string; rounds: number };

export type MultiClickSet = MouseDrillMeta & { kind: 'multi-click'; items: readonly NamedPicture[]; targetCounts: readonly number[]; size: TargetSize; ordered: boolean };
export type DoubleClickSet = MouseDrillMeta & { kind: 'double-click'; items: readonly NamedPicture[] };
export type TrailSet = MouseDrillMeta & { kind: 'trail'; items: readonly Trail[]; checkpointSize: TargetSize; hold: boolean };
/** Each item is one round: the zones shown, with `itemCount` pictures split evenly across them. */
export type MultiDragSet = MouseDrillMeta & { kind: 'multi-drag'; items: readonly (readonly SortGroup[])[]; itemCount: number };
export type MouseDrillSet = MultiClickSet | DoubleClickSet | TrailSet | MultiDragSet;

const MOUSE_DRILL_ROUNDS = 6;

export const DOUBLE_CLICK_ITEMS = [
  { emoji: '🎁', name: 'hộp quà' },
  { emoji: '🚪', name: 'cánh cửa' },
  { emoji: '📦', name: 'thùng đồ' },
  { emoji: '🧰', name: 'hộp đồ nghề' },
  { emoji: '📫', name: 'hộp thư' },
  { emoji: '🧳', name: 'chiếc vali' },
  { emoji: '💼', name: 'chiếc cặp' },
  { emoji: '🥚', name: 'quả trứng' },
  { emoji: '📕', name: 'quyển sách' },
] as const;

export const LONG_TRAILS = [
  [[8, 50], [18, 28], [28, 50], [38, 72], [48, 50], [58, 28], [68, 50], [78, 72], [90, 50]],
  [[8, 26], [17, 48], [26, 70], [35, 48], [44, 26], [53, 48], [62, 70], [71, 48], [80, 26], [92, 48]],
  [[8, 74], [16, 52], [24, 30], [32, 52], [40, 74], [48, 52], [56, 30], [64, 52], [72, 74], [80, 52], [92, 30]],
  [[8, 30], [15, 52], [22, 74], [30, 52], [38, 30], [46, 52], [54, 74], [62, 52], [70, 30], [78, 52], [85, 74], [92, 52]],
  [[10, 24], [30, 24], [50, 24], [70, 24], [90, 24], [90, 76], [70, 76], [50, 76], [30, 76], [10, 76]],
  [[10, 76], [10, 50], [10, 24], [28, 24], [28, 50], [28, 76], [46, 76], [46, 50], [46, 24], [66, 24], [88, 24]],
  [[8, 50], [16, 24], [24, 50], [32, 76], [40, 50], [48, 24], [56, 50], [64, 76], [72, 50], [80, 24], [86, 50], [92, 76]],
  [[10, 24], [10, 76], [28, 76], [28, 24], [46, 24], [46, 76], [64, 76], [64, 24], [82, 24], [92, 76]],
] as const;

export const SORT_GROUPS = [
  { id: 'fruit', place: '🧺', label: 'Giỏ trái cây', kind: 'trái cây', items: [{ emoji: '🍎', name: 'quả táo' }, { emoji: '🍌', name: 'quả chuối' }, { emoji: '🍇', name: 'chùm nho' }, { emoji: '🍊', name: 'quả cam' }, { emoji: '🍉', name: 'quả dưa hấu' }] },
  { id: 'vehicle', place: '🅿️', label: 'Bãi đỗ xe', kind: 'xe cộ', items: [{ emoji: '🚗', name: 'ô tô' }, { emoji: '🚌', name: 'xe buýt' }, { emoji: '🚲', name: 'xe đạp' }, { emoji: '🛵', name: 'xe máy' }] },
  { id: 'sky', place: '☁️', label: 'Bầu trời', kind: 'đồ bay trên trời', items: [{ emoji: '✈️', name: 'máy bay' }, { emoji: '🚀', name: 'tên lửa' }, { emoji: '🎈', name: 'bóng bay' }, { emoji: '🚁', name: 'máy bay trực thăng' }] },
  { id: 'sea', place: '🌊', label: 'Biển', kind: 'con vật dưới nước', items: [{ emoji: '🐟', name: 'con cá' }, { emoji: '🐙', name: 'bạch tuộc' }, { emoji: '🦀', name: 'con cua' }, { emoji: '🐬', name: 'cá heo' }] },
  { id: 'farm', place: '🏡', label: 'Trang trại', kind: 'vật nuôi', items: [{ emoji: '🐔', name: 'con gà' }, { emoji: '🐷', name: 'con lợn' }, { emoji: '🐮', name: 'con bò' }, { emoji: '🐑', name: 'con cừu' }] },
  { id: 'school', place: '🎒', label: 'Cặp sách', kind: 'đồ dùng học tập', items: [{ emoji: '✏️', name: 'bút chì' }, { emoji: '📏', name: 'thước kẻ' }, { emoji: '📘', name: 'quyển vở' }, { emoji: '✂️', name: 'cái kéo' }] },
  { id: 'toys', place: '🧸', label: 'Góc đồ chơi', kind: 'đồ chơi', items: [{ emoji: '⚽', name: 'quả bóng' }, { emoji: '🧩', name: 'miếng ghép hình' }, { emoji: '🎲', name: 'xúc xắc' }, { emoji: '🤖', name: 'người máy' }] },
  { id: 'vegetable', place: '🍲', label: 'Nồi canh', kind: 'rau củ', items: [{ emoji: '🥕', name: 'cà rốt' }, { emoji: '🥦', name: 'bông cải' }, { emoji: '🌽', name: 'bắp ngô' }, { emoji: '🥔', name: 'củ khoai tây' }] },
] as const satisfies readonly SortGroup[];

const groupById = (id: (typeof SORT_GROUPS)[number]['id']) => SORT_GROUPS.find((group) => group.id === id)!;

export const GROUP_PAIRS = ([
  ['fruit', 'vehicle'],
  ['sky', 'sea'],
  ['farm', 'school'],
  ['toys', 'vegetable'],
  ['fruit', 'sea'],
  ['vehicle', 'farm'],
  ['sky', 'toys'],
  ['school', 'vegetable'],
  ['sea', 'farm'],
] as const).map((ids) => ids.map(groupById));

export const MOUSE_DRILL_SETS: Record<MouseDrillId, MouseDrillSet> = {
  'mouse-click-many': {
    kind: 'multi-click',
    title: 'Chuột nâng cao 1 · Click hết các hình',
    intro: 'Hãy click vào hết các hình trong khung.',
    emoji: '🎯',
    rounds: MOUSE_DRILL_ROUNDS,
    items: CLICK_TARGETS,
    targetCounts: [3],
    size: 'medium',
    ordered: false,
  },
  'mouse-click-order': {
    kind: 'multi-click',
    title: 'Chuột nâng cao 2 · Click theo số',
    intro: 'Hãy click các hình theo số, từ số 1 trở đi.',
    emoji: '🎈',
    rounds: MOUSE_DRILL_ROUNDS,
    items: CLICK_TARGETS,
    targetCounts: [4, 5],
    size: 'medium',
    ordered: true,
  },
  'mouse-click-small': {
    kind: 'multi-click',
    title: 'Chuột nâng cao 3 · Click hình nhỏ',
    intro: 'Hãy click vào hết các hình nhỏ trong khung.',
    emoji: '🔍',
    rounds: MOUSE_DRILL_ROUNDS,
    items: CLICK_TARGETS,
    targetCounts: [5],
    size: 'small',
    ordered: false,
  },
  'mouse-double-click': {
    kind: 'double-click',
    title: 'Chuột nâng cao 4 · Nháy đúp chuột',
    intro: 'Hãy nháy đúp chuột, bấm nhanh hai lần để mở đồ vật.',
    emoji: '🎁',
    rounds: MOUSE_DRILL_ROUNDS,
    items: DOUBLE_CLICK_ITEMS,
  },
  'mouse-trail-long': {
    kind: 'trail',
    title: 'Chuột nâng cao 5 · Rê chuột đường dài',
    intro: 'Hãy đưa chuột qua thật nhiều điểm nhỏ tới đích.',
    emoji: '🛤️',
    rounds: MOUSE_DRILL_ROUNDS,
    items: LONG_TRAILS,
    checkpointSize: 'small',
    hold: false,
  },
  'mouse-drag-many': {
    kind: 'multi-drag',
    title: 'Chuột nâng cao 6 · Kéo nhiều món',
    intro: 'Hãy kéo hết các món vào đúng chỗ.',
    emoji: '📦',
    rounds: MOUSE_DRILL_ROUNDS,
    items: SORT_GROUPS.map((group) => [group]),
    itemCount: 3,
  },
  'mouse-drag-groups': {
    kind: 'multi-drag',
    title: 'Chuột nâng cao 7 · Phân loại hai nhóm',
    intro: 'Hãy kéo mỗi món vào đúng một trong hai chỗ.',
    emoji: '🗂️',
    rounds: MOUSE_DRILL_ROUNDS,
    items: GROUP_PAIRS,
    itemCount: 4,
  },
  'mouse-hold-trail': {
    kind: 'trail',
    title: 'Chuột nâng cao 8 · Giữ chuột kéo theo đường',
    intro: 'Hãy giữ chặt nút chuột trái và kéo theo đường tới đích.',
    emoji: '✊',
    rounds: MOUSE_DRILL_ROUNDS,
    items: TRAILS,
    checkpointSize: 'medium',
    hold: true,
  },
};
