import ClickTargetGame from '../games/ClickTargetGame';
import DragMatchGame from '../games/DragMatchGame';
import DragSortGame from '../games/DragSortGame';
import FindKeyGame from '../games/FindKeyGame';
import LetterKeyGame from '../games/LetterKeyGame';
import NumberKeyGame from '../games/NumberKeyGame';
import SequenceTypingGame from '../games/SequenceTypingGame';
import WordTypingGame from '../games/WordTypingGame';
import MouseTrailGame from '../games/MouseTrailGame';
import PickPictureGame from '../games/PickPictureGame';
import SpaceEnterGame from '../games/SpaceEnterGame';
import { GAME_IDS, type GameDefinition, type GameId } from './types';

const GAME_DEFINITIONS: Record<GameId, Omit<GameDefinition, 'id' | 'order'>> = {
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
};

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