import type { AdvancedGameId } from '../game/types';

/** `text` is typed key by key: uppercase unaccented letters and digits, ' ' for Space, '\n' for Enter. */
export type DrillItem = { text: string; emoji: string; say: string };

export type DrillSet = {
  title: string;
  intro: string;
  emoji: string;
  rounds: number;
  items: readonly DrillItem[];
};

const DRILL_ROUNDS = 6;

const rowItems = (emoji: string, entries: readonly (readonly [string, string])[]): DrillItem[] =>
  entries.map(([text, say]) => ({ text, emoji, say }));

export const KEYBOARD_ROWS = {
  'drill-home-row': 'ASDFGHJKL',
  'drill-top-row': 'QWERTYUIOP',
  'drill-bottom-row': 'ZXCVBNM',
} as const;

export const DRILL_SETS: Record<AdvancedGameId, DrillSet> = {
  'drill-home-row': {
    title: 'Nâng cao 1 · Hàng phím giữa',
    intro: 'Hãy gõ các chữ ở hàng phím giữa.',
    emoji: '🐾',
    rounds: DRILL_ROUNDS,
    items: rowItems('🐾', [
      ['ASDF', 'A S D F'],
      ['HJKL', 'H J K L'],
      ['SDFG', 'S D F G'],
      ['DFGH', 'D F G H'],
      ['LKJH', 'L K J H'],
      ['HAHA', 'Ha ha'],
      ['LALA', 'La la'],
      ['ASDFG', 'A S D F G'],
      ['GHJKL', 'G H J K L'],
      ['GFDSA', 'G F D S A'],
      ['SALAD', 'Sa lát'],
    ]),
  },
  'drill-top-row': {
    title: 'Nâng cao 2 · Hàng phím trên',
    intro: 'Hãy gõ các chữ ở hàng phím trên.',
    emoji: '🚂',
    rounds: DRILL_ROUNDS,
    items: rowItems('🚂', [
      ['QWER', 'Q W E R'],
      ['UIOP', 'U I O P'],
      ['TYUI', 'T Y U I'],
      ['ERTY', 'E R T Y'],
      ['QUET', 'Quét'],
      ['TUOI', 'Tươi'],
      ['QWERT', 'Q W E R T'],
      ['YUIOP', 'Y U I O P'],
      ['WERTY', 'W E R T Y'],
      ['POIUY', 'P O I U Y'],
      ['TRUOT', 'Trượt'],
    ]),
  },
  'drill-bottom-row': {
    title: 'Nâng cao 3 · Hàng phím dưới',
    intro: 'Hãy gõ các chữ ở hàng phím dưới.',
    emoji: '🐛',
    rounds: DRILL_ROUNDS,
    items: rowItems('🐛', [
      ['ZXCV', 'Z X C V'],
      ['XCVB', 'X C V B'],
      ['CVBN', 'C V B N'],
      ['VBNM', 'V B N M'],
      ['MNBV', 'M N B V'],
      ['ZXCVB', 'Z X C V B'],
      ['XCVBN', 'X C V B N'],
      ['CVBNM', 'C V B N M'],
      ['MNBVC', 'M N B V C'],
      ['BVCXZ', 'B V C X Z'],
      ['NMBVC', 'N M B V C'],
    ]),
  },
  'drill-long-words': {
    title: 'Nâng cao 4 · Từ dài',
    intro: 'Hãy gõ từ dài theo hình.',
    emoji: '📖',
    rounds: DRILL_ROUNDS,
    items: [
      { text: 'BUOM', emoji: '🦋', say: 'Bướm' },
      { text: 'NUOC', emoji: '💧', say: 'Nước' },
      { text: 'BANH', emoji: '🍞', say: 'Bánh' },
      { text: 'GIAY', emoji: '👟', say: 'Giày' },
      { text: 'HUOU', emoji: '🦌', say: 'Hươu' },
      { text: 'CHUOI', emoji: '🍌', say: 'Chuối' },
      { text: 'CHUOT', emoji: '🐭', say: 'Chuột' },
      { text: 'TRANG', emoji: '🌙', say: 'Trăng' },
      { text: 'TRUNG', emoji: '🥚', say: 'Trứng' },
      { text: 'THUYEN', emoji: '⛵', say: 'Thuyền' },
      { text: 'TRUONG', emoji: '🏫', say: 'Trường' },
    ],
  },
  'drill-two-words': {
    title: 'Nâng cao 5 · Hai từ',
    intro: 'Hãy gõ hai từ, giữa hai từ bấm phím cách.',
    emoji: '👫',
    rounds: DRILL_ROUNDS,
    items: [
      { text: 'BE AN', emoji: '🍚', say: 'Bé ăn' },
      { text: 'ME OI', emoji: '👩', say: 'Mẹ ơi' },
      { text: 'BA ME', emoji: '👨‍👩‍👧', say: 'Ba mẹ' },
      { text: 'GA CON', emoji: '🐥', say: 'Gà con' },
      { text: 'XE DAP', emoji: '🚲', say: 'Xe đạp' },
      { text: 'CHO CON', emoji: '🐶', say: 'Chó con' },
      { text: 'MEO CON', emoji: '🐱', say: 'Mèo con' },
      { text: 'CA VANG', emoji: '🐠', say: 'Cá vàng' },
      { text: 'KEM DAU', emoji: '🍨', say: 'Kem dâu' },
      { text: 'BANH MI', emoji: '🥖', say: 'Bánh mì' },
      { text: 'BONG BAY', emoji: '🎈', say: 'Bóng bay' },
      { text: 'GAU BONG', emoji: '🧸', say: 'Gấu bông' },
    ],
  },
  'drill-numbers': {
    title: 'Nâng cao 6 · Số và chữ',
    intro: 'Hãy gõ số rồi gõ chữ, nhớ bấm phím cách.',
    emoji: '🔟',
    rounds: DRILL_ROUNDS,
    items: [
      { text: '2 MAT', emoji: '👀', say: 'Hai mắt' },
      { text: '2 TAI', emoji: '👂', say: 'Hai tai' },
      { text: '5 SAO', emoji: '⭐', say: 'Năm sao' },
      { text: '7 MAU', emoji: '🌈', say: 'Bảy màu' },
      { text: '4 CHAN', emoji: '🐕', say: 'Bốn chân' },
      { text: '10 NGON', emoji: '🖐️', say: 'Mười ngón' },
      { text: '100 DIEM', emoji: '💯', say: 'Một trăm điểm' },
      { text: '2 CON GA', emoji: '🐔', say: 'Hai con gà' },
      { text: '3 QUA TAO', emoji: '🍎', say: 'Ba quả táo' },
      { text: '1 CON MEO', emoji: '🐈', say: 'Một con mèo' },
      { text: '6 CHU VIT', emoji: '🦆', say: 'Sáu chú vịt' },
    ],
  },
  'drill-sentences': {
    title: 'Nâng cao 7 · Câu ngắn',
    intro: 'Hãy gõ một câu ba từ.',
    emoji: '💬',
    rounds: DRILL_ROUNDS,
    items: [
      { text: 'BE DI HOC', emoji: '🎒', say: 'Bé đi học' },
      { text: 'ME NAU AN', emoji: '🍳', say: 'Mẹ nấu ăn' },
      { text: 'BA DI LAM', emoji: '💼', say: 'Ba đi làm' },
      { text: 'BE AN COM', emoji: '🍚', say: 'Bé ăn cơm' },
      { text: 'BE TAP GO', emoji: '⌨️', say: 'Bé tập gõ' },
      { text: 'MEO AN CA', emoji: '🐱', say: 'Mèo ăn cá' },
      { text: 'BE DA BONG', emoji: '⚽', say: 'Bé đá bóng' },
      { text: 'CA BOI LOI', emoji: '🐟', say: 'Cá bơi lội' },
      { text: 'BE VE TRANH', emoji: '🎨', say: 'Bé vẽ tranh' },
      { text: 'BE NGU NGON', emoji: '😴', say: 'Bé ngủ ngon' },
      { text: 'BE DOC SACH', emoji: '📖', say: 'Bé đọc sách' },
      { text: 'BE UONG SUA', emoji: '🥛', say: 'Bé uống sữa' },
    ],
  },
  'drill-sentence-enter': {
    title: 'Nâng cao 8 · Câu dài và Enter',
    intro: 'Hãy gõ cả câu rồi bấm phím Enter.',
    emoji: '🏁',
    rounds: DRILL_ROUNDS,
    items: [
      { text: 'BE YEU ME\n', emoji: '❤️', say: 'Bé yêu mẹ' },
      { text: 'BA LAI XE\n', emoji: '🚗', say: 'Ba lái xe' },
      { text: 'BE CHAO CO\n', emoji: '👋', say: 'Bé chào cô' },
      { text: 'BE RUA TAY\n', emoji: '🧼', say: 'Bé rửa tay' },
      { text: 'CA NHA VUI\n', emoji: '🏠', say: 'Cả nhà vui' },
      { text: 'BE TUOI CAY\n', emoji: '🌱', say: 'Bé tưới cây' },
      { text: 'ME MUA BANH\n', emoji: '🎂', say: 'Mẹ mua bánh' },
      { text: 'CHIM BAY CAO\n', emoji: '🐦', say: 'Chim bay cao' },
      { text: 'CHIM HOT HAY\n', emoji: '🎶', say: 'Chim hót hay' },
      { text: 'ME BE DI CHO\n', emoji: '🛒', say: 'Mẹ bé đi chợ' },
      { text: 'BA ME YEU BE\n', emoji: '👪', say: 'Ba mẹ yêu bé' },
      { text: 'MEO BAT CHUOT\n', emoji: '🐈', say: 'Mèo bắt chuột' },
    ],
  },
};
