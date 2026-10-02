import type { ComponentType } from 'react';
import ClickTargetGame from '../games/ClickTargetGame';
import CountKeysGame from '../games/CountKeysGame';
import DragMatchGame from '../games/DragMatchGame';
import DragSortGame from '../games/DragSortGame';
import FindKeyGame from '../games/FindKeyGame';
import LetterKeyGame from '../games/LetterKeyGame';
import NumberKeyGame from '../games/NumberKeyGame';
import SequenceTypingGame from '../games/SequenceTypingGame';
import WordTypingGame from '../games/WordTypingGame';
import MouseTrailGame, { createMouseTrailGame } from '../games/MouseTrailGame';
import PickPictureGame from '../games/PickPictureGame';
import SpaceEnterGame from '../games/SpaceEnterGame';
import { DRILL_SETS } from '../games/drills';
import { createTypingDrillGame } from '../games/TypingDrillGame';
import { createDoubleClickGame } from '../games/DoubleClickGame';
import { MOUSE_DRILL_SETS, type MouseDrillSet } from '../games/mouseDrills';
import { createMultiClickGame } from '../games/MultiClickGame';
import { createMultiDragGame } from '../games/MultiDragGame';
import { MISSION_SETS } from '../games/missions';
import { createMissionGame } from '../games/MissionGame';
import { FUN_SETS, type FunSet } from '../games/funGames';
import { createPopKeysGame } from '../games/PopKeysGame';
import { createMemoryGame } from '../games/MemoryGame';
import { createPuzzleGame } from '../games/PuzzleGame';
import { createPianoGame } from '../games/PianoGame';
import { createTrainGame } from '../games/TrainGame';
import { createMoleGame } from '../games/MoleGame';
import { createShadowGame } from '../games/ShadowGame';
import { createPaintGame } from '../games/PaintGame';
import { createEraserGame } from '../games/EraserGame';
import { createScrollGame } from '../games/ScrollGame';
import { createArrowsGame } from '../games/ArrowsGame';
import { createCloseWindowGame } from '../games/CloseWindowGame';
import { createSearchBoxGame } from '../games/SearchBoxGame';
import { FUN_IDS, GAME_IDS, MISSION_IDS, MOUSE_DRILL_IDS, TYPING_DRILL_IDS, type BasicGameId, type FunId, type GameDefinition, type GameId, type MiniGameProps, type MissionId, type MouseDrillId, type TypingDrillId } from './types';

type GameMeta = Omit<GameDefinition, 'id' | 'order'>;

const BASIC_GAME_DEFINITIONS: Record<BasicGameId, GameMeta> = {
  letters: { title: 'Gõ chữ cái', category: 'keyboard', rounds: 10, intro: 'Hãy bấm chữ đang hiện trên màn hình.', emoji: '🔤', component: LetterKeyGame },
  numbers: { title: 'Gõ số', category: 'keyboard', rounds: 10, intro: 'Hãy bấm số đang hiện trên màn hình.', emoji: '🔢', component: NumberKeyGame },
  words: { title: 'Gõ từ ngắn', category: 'keyboard', rounds: 8, intro: 'Hãy gõ từ đang hiện trên màn hình.', emoji: '📝', component: WordTypingGame },
  'find-key': { title: 'Tìm phím đúng', category: 'keyboard', rounds: 10, intro: 'Hãy tìm và bấm đúng phím.', emoji: '⌨️', component: FindKeyGame },
  sequence: { title: 'Gõ chuỗi phím', category: 'keyboard', rounds: 8, intro: 'Hãy gõ từng phím theo thứ tự.', emoji: '🎹', component: SequenceTypingGame },
  'click-target': { title: 'Click mục tiêu', category: 'mouse', rounds: 12, intro: 'Hãy click vào hình đang hiện trong khung.', emoji: '⭐', component: ClickTargetGame },
  'pick-picture': { title: 'Click đúng hình', category: 'mouse', rounds: 10, intro: 'Hãy click vào hình được yêu cầu.', emoji: '🖼️', component: PickPictureGame },
  'mouse-trail': { title: 'Rê chuột theo đường', category: 'mouse', rounds: 6, intro: 'Hãy đưa chuột theo các điểm đến đích.', emoji: '🐭', component: MouseTrailGame },
  'drag-sort': { title: 'Kéo thả phân loại', category: 'mouse', rounds: 8, intro: 'Hãy kéo đồ vật vào đúng nơi.', emoji: '🧺', component: DragSortGame },
  'drag-match': { title: 'Kéo thả ghép cặp', category: 'mouse', rounds: 8, intro: 'Hãy kéo hình vào đúng cặp.', emoji: '🧩', component: DragMatchGame },
  'space-enter': { title: 'Phím cách và Enter', category: 'keyboard', rounds: 10, intro: 'Hãy bấm phím cách hoặc phím Enter theo hình.', emoji: '🚀', component: SpaceEnterGame },
  'count-keys': { title: 'Đếm rồi bấm số', category: 'keyboard', rounds: 9, intro: 'Hãy đếm hình rồi bấm phím số đúng.', emoji: '🍎', component: CountKeysGame },
};

const DRILL_GAME_DEFINITIONS = Object.fromEntries(
  TYPING_DRILL_IDS.map((id) => {
    const set = DRILL_SETS[id];
    const meta: GameMeta = { title: set.title, category: 'keyboard', rounds: set.rounds, intro: set.intro, emoji: set.emoji, component: createTypingDrillGame(set) };
    return [id, meta];
  }),
) as Record<TypingDrillId, GameMeta>;

function createMouseDrillGame(set: MouseDrillSet): ComponentType<MiniGameProps> {
  switch (set.kind) {
    case 'multi-click': return createMultiClickGame(set);
    case 'double-click': return createDoubleClickGame(set);
    case 'trail': return createMouseTrailGame({ trails: set.items, checkpointSize: set.checkpointSize, hold: set.hold });
    case 'multi-drag': return createMultiDragGame(set);
  }
}

const MOUSE_DRILL_GAME_DEFINITIONS = Object.fromEntries(
  MOUSE_DRILL_IDS.map((id) => {
    const set = MOUSE_DRILL_SETS[id];
    const meta: GameMeta = { title: set.title, category: 'mouse', rounds: set.rounds, intro: set.intro, emoji: set.emoji, component: createMouseDrillGame(set) };
    return [id, meta];
  }),
) as Record<MouseDrillId, GameMeta>;

const MISSION_GAME_DEFINITIONS = Object.fromEntries(
  MISSION_IDS.map((id) => {
    const set = MISSION_SETS[id];
    const meta: GameMeta = { title: set.title, category: 'mouse', rounds: set.rounds, intro: set.intro, emoji: set.emoji, component: createMissionGame(set) };
    return [id, meta];
  }),
) as Record<MissionId, GameMeta>;

function createFunGame(set: FunSet): ComponentType<MiniGameProps> {
  switch (set.kind) {
    case 'pop-keys': return createPopKeysGame(set);
    case 'memory': return createMemoryGame(set);
    case 'puzzle': return createPuzzleGame(set);
    case 'multi-drag': return createMultiDragGame(set);
    case 'piano': return createPianoGame(set);
    case 'train': return createTrainGame(set);
    case 'mole': return createMoleGame(set);
    case 'shadow': return createShadowGame(set);
    case 'paint': return createPaintGame(set);
    case 'eraser': return createEraserGame(set);
    case 'scroll': return createScrollGame(set);
    case 'arrows': return createArrowsGame(set);
    case 'close': return createCloseWindowGame(set);
    case 'search': return createSearchBoxGame(set);
  }
}

export const KEYBOARD_FUN_KINDS: readonly FunSet['kind'][] = ['pop-keys', 'piano', 'train', 'eraser', 'arrows', 'search'];

const FUN_GAME_DEFINITIONS = Object.fromEntries(
  FUN_IDS.map((id) => {
    const set = FUN_SETS[id];
    const meta: GameMeta = { title: set.title, category: KEYBOARD_FUN_KINDS.includes(set.kind) ? 'keyboard' : 'mouse', rounds: set.rounds, intro: set.intro, emoji: set.emoji, component: createFunGame(set) };
    return [id, meta];
  }),
) as Record<FunId, GameMeta>;

const GAME_DEFINITIONS: Record<GameId, GameMeta> = { ...BASIC_GAME_DEFINITIONS, ...DRILL_GAME_DEFINITIONS, ...MOUSE_DRILL_GAME_DEFINITIONS, ...MISSION_GAME_DEFINITIONS, ...FUN_GAME_DEFINITIONS };

export const gameRegistry: GameDefinition[] = GAME_IDS.map((id, index) => ({
  id,
  order: index + 1,
  ...GAME_DEFINITIONS[id],
}));

const gameRegistryById = Object.fromEntries(
  gameRegistry.map((game) => [game.id, game]),
) as Record<GameId, GameDefinition>;

export function getGameDefinition(gameId: GameId): GameDefinition {
  return gameRegistryById[gameId];
}