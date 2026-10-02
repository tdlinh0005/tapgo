import type { MissionId } from '../game/types';
import type { NamedPicture, TargetSize } from './mouseDrills';

export type Thief = NamedPicture & { hits: number };

/** One thief per count holds one loot item; a thief needing several hits hops to a free slot after each hit. */
export type MissionSet = {
  title: string;
  intro: string;
  emoji: string;
  rounds: number;
  scene: string;
  prompt: string;
  listen: string;
  thief: Thief;
  thiefCounts: readonly number[];
  friendCount: number;
  hideoutCount: number;
  size: TargetSize;
};

export const FRIENDS = [
  { emoji: '🐰', name: 'bạn thỏ' },
  { emoji: '🐶', name: 'bạn cún' },
  { emoji: '🐥', name: 'bạn gà con' },
  { emoji: '🐻', name: 'bạn gấu' },
  { emoji: '🐷', name: 'bạn heo' },
  { emoji: '🐑', name: 'bạn cừu' },
  { emoji: '🐸', name: 'bạn ếch' },
  { emoji: '🐮', name: 'bạn bò' },
] as const satisfies readonly NamedPicture[];

export const LOOT = [
  { emoji: '🍪', name: 'bánh quy' },
  { emoji: '💎', name: 'viên ngọc' },
  { emoji: '🧸', name: 'gấu bông' },
  { emoji: '🎁', name: 'hộp quà' },
  { emoji: '🍰', name: 'bánh kem' },
  { emoji: '🍎', name: 'quả táo' },
  { emoji: '🎈', name: 'bóng bay' },
  { emoji: '⚽', name: 'quả bóng' },
] as const satisfies readonly NamedPicture[];

export const HIDEOUTS = [
  { emoji: '🌳', name: 'cái cây' },
  { emoji: '📦', name: 'thùng giấy' },
  { emoji: '🗑️', name: 'thùng rác' },
  { emoji: '🌿', name: 'bụi cây' },
  { emoji: '🧺', name: 'cái giỏ' },
] as const satisfies readonly NamedPicture[];

const THIEF: Thief = { emoji: '🦝', name: 'gấu mèo trộm', hits: 1 };
const BOSS: Thief = { emoji: '🦹', name: 'trùm Gấu Mèo', hits: 3 };
const MISSION_ROUNDS = 6;

export const MISSION_SETS: Record<MissionId, MissionSet> = {
  'mission-park': {
    title: 'Nhiệm vụ 1 · Bắt trộm ở công viên',
    intro: 'Gấu mèo lấy trộm đồ ăn! Hãy click vào gấu mèo để bắt và lấy lại đồ.',
    emoji: '🦝',
    rounds: MISSION_ROUNDS,
    scene: 'park',
    prompt: 'Click bắt hết gấu mèo trộm',
    listen: 'Click vào từng bạn gấu mèo đeo mặt nạ để lấy lại đồ',
    thief: THIEF,
    thiefCounts: [2, 3],
    friendCount: 0,
    hideoutCount: 0,
    size: 'medium',
  },
  'mission-market': {
    title: 'Nhiệm vụ 2 · Đừng bắt nhầm bạn tốt',
    intro: 'Ở chợ có cả bạn tốt. Chỉ click vào gấu mèo trộm thôi nhé.',
    emoji: '🛒',
    rounds: MISSION_ROUNDS,
    scene: 'market',
    prompt: 'Chỉ bắt gấu mèo trộm',
    listen: 'Chỉ click vào gấu mèo đeo mặt nạ, không click vào các bạn tốt',
    thief: THIEF,
    thiefCounts: [3],
    friendCount: 2,
    hideoutCount: 0,
    size: 'medium',
  },
  'mission-hide': {
    title: 'Nhiệm vụ 3 · Tìm trộm đang trốn',
    intro: 'Gấu mèo trốn kỹ lắm. Hãy click vào chỗ trốn để tìm, rồi click để bắt.',
    emoji: '🔍',
    rounds: MISSION_ROUNDS,
    scene: 'hide',
    prompt: 'Tìm rồi bắt gấu mèo trộm',
    listen: 'Click vào các chỗ trốn để tìm gấu mèo, thấy gấu mèo thì click để bắt',
    thief: THIEF,
    thiefCounts: [2],
    friendCount: 0,
    hideoutCount: 5,
    size: 'medium',
  },
  'mission-small': {
    title: 'Nhiệm vụ 4 · Bắt trộm tí hon',
    intro: 'Gấu mèo thu nhỏ để trốn trong phòng đồ chơi. Hãy nhìn kỹ và click thật chính xác.',
    emoji: '🧸',
    rounds: MISSION_ROUNDS,
    scene: 'small',
    prompt: 'Bắt hết gấu mèo tí hon',
    listen: 'Click vào từng bạn gấu mèo nhỏ xíu, không click vào các bạn tốt',
    thief: THIEF,
    thiefCounts: [4],
    friendCount: 3,
    hideoutCount: 0,
    size: 'small',
  },
  'mission-boss': {
    title: 'Nhiệm vụ 5 · Bắt trùm Gấu Mèo',
    intro: 'Trùm Gấu Mèo nhảy sang chỗ khác mỗi lần bị click trúng. Click trúng ba lần để bắt trùm nhé.',
    emoji: '🦹',
    rounds: MISSION_ROUNDS,
    scene: 'boss',
    prompt: 'Click trúng trùm Gấu Mèo ba lần',
    listen: 'Trùm Gấu Mèo sẽ nhảy sang chỗ khác sau mỗi lần trúng, click đuổi theo ba lần nhé',
    thief: BOSS,
    thiefCounts: [1],
    friendCount: 3,
    hideoutCount: 0,
    size: 'medium',
  },
};
