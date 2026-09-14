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
import PlaceholderGame from '../games/PlaceholderGame';
import type { GameDefinition, GameId } from './types';

export const gameRegistry: GameDefinition[] = [
  { id: 'letters', title: 'Gõ chữ cái', category: 'keyboard', order: 1, rounds: 10, intro: 'Hãy bấm chữ đang hiện trên màn hình.', emoji: '🔤', component: LetterKeyGame },
  { id: 'numbers', title: 'Gõ số', category: 'keyboard', order: 2, rounds: 10, intro: 'Hãy bấm số đang hiện trên màn hình.', emoji: '🔢', component: NumberKeyGame },
  { id: 'words', title: 'Gõ từ ngắn', category: 'keyboard', order: 3, rounds: 8, intro: 'Hãy gõ từ đang hiện trên màn hình.', emoji: '📝', component: WordTypingGame },
  { id: 'find-key', title: 'Tìm phím đúng', category: 'keyboard', order: 4, rounds: 10, intro: 'Hãy tìm và bấm đúng phím.', emoji: '⌨️', component: FindKeyGame },
  { id: 'sequence', title: 'Gõ chuỗi phím', category: 'keyboard', order: 5, rounds: 8, intro: 'Hãy gõ từng phím theo thứ tự.', emoji: '🎹', component: SequenceTypingGame },
  { id: 'click-target', title: 'Click mục tiêu', category: 'mouse', order: 6, rounds: 12, intro: 'Hãy click vào ngôi sao.', emoji: '⭐', component: ClickTargetGame },
  { id: 'pick-picture', title: 'Click đúng hình', category: 'mouse', order: 7, rounds: 10, intro: 'Hãy click vào hình được yêu cầu.', emoji: '🖼️', component: PickPictureGame },
  { id: 'mouse-trail', title: 'Rê chuột theo đường', category: 'mouse', order: 8, rounds: 6, intro: 'Hãy đưa chuột theo các điểm đến đích.', emoji: '🐭', component: MouseTrailGame },
  { id: 'drag-sort', title: 'Kéo thả phân loại', category: 'mouse', order: 9, rounds: 8, intro: 'Hãy kéo đồ vật vào đúng nơi.', emoji: '🧺', component: DragSortGame },
  { id: 'drag-match', title: 'Kéo thả ghép cặp', category: 'mouse', order: 10, rounds: 8, intro: 'Hãy kéo hình vào đúng cặp.', emoji: '🧩', component: DragMatchGame },
];

export function getGameDefinition(gameId: GameId): GameDefinition | undefined {
  return gameRegistry.find((game) => game.id === gameId);
}