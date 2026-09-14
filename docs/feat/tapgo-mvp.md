# TapGo MVP Feature Specification

> updated 2026-09-14 · pre-git

## Goal

Tạo một web app desktop đơn giản cho trẻ khoảng 6 tuổi làm quen với bàn phím và chuột thông qua 10 mini-game ngắn, vui, ít chữ, phản hồi tích cực và không gây áp lực thời gian.

## Product decisions đã chốt

- Nền tảng: desktop/laptop, ưu tiên chuột thật và bàn phím thật; không tối ưu touch/mobile trong MVP.
- Stack: React + Vite + TypeScript.
- Lưu tiến độ: localStorage, không tài khoản, không backend.
- Luyện gõ: A-Z, 0-9, Space/Enter khi cần, và từ tiếng Việt không dấu như `ME`, `BA`, `CON`, `MEO`, `CHO`, `NHA`, `XE`.
- Luyện chuột: click, rê chuột, kéo thả.
- Điều hướng học: có lộ trình gợi ý theo thứ tự nhưng vẫn có khu Chơi tự do mở toàn bộ game.
- Phản hồi: 1-3 sao, âm thanh nhẹ, animation ngắn; không dùng thông báo thất bại nặng nề.
- Hướng dẫn: chữ ngắn + icon + giọng đọc.
- Speech: Web Speech API (`speechSynthesis`) với locale `vi-VN`; luôn có nút nghe lại.
- Nhịp chơi: mỗi bài được thiết kế để hoàn thành khoảng 3-5 phút bằng số lượt chơi cố định, không dùng countdown ép thời gian.
- Chủ đề: trộn động vật, đồ chơi, xe, không gian; giữ cùng hệ thống card, typography, animation và cách trình bày.
- Kiến trúc: Game framework dùng chung + từng mini-game cắm logic riêng.

## Review decisions

### Giữ

`GameShell` là đúng abstraction boundary vì 10 game đều cần chung hướng dẫn, tiến độ lượt, phản hồi đúng/sai, tính sao, hoàn thành và lưu tiến độ.

### Sửa

Không dùng `Timer` hiển thị hay countdown. Đây là xung đột với mục tiêu giảm áp lực cho trẻ. Game dùng `roundIndex / totalRounds` và thanh tiến độ theo lượt.

Triển khai theo vertical slice: framework + 1 game bàn phím + 1 game chuột trước, xác nhận toàn bộ luồng từ Home -> chơi -> sao -> lưu localStorage, sau đó mới thêm 8 game còn lại.

## Information architecture

```text
App
├── Home
│   ├── Bắt đầu lộ trình
│   ├── Chơi tự do
│   └── Tiến độ
├── Learning Path
│   └── 10 bài theo thứ tự
├── Free Play
│   └── 10 game luôn mở
├── Game
│   └── GameShell + MiniGame
└── Progress
    └── tổng sao + trạng thái từng game
```

App không cần URL routing trong MVP. `App` giữ một view state nhỏ vì đây là single-user local app và không có nhu cầu deep-link.

## Learning path

Trong màn hình Lộ trình, game 1 mở sẵn. Game N được mở khi game N-1 đã hoàn thành ít nhất một lần. Trong Chơi tự do, cả 10 game luôn mở.

Thứ tự:

1. Gõ chữ cái
2. Gõ số
3. Gõ từ ngắn
4. Tìm phím đúng
5. Gõ chuỗi phím
6. Click mục tiêu lớn
7. Click đúng hình
8. Rê chuột theo đường
9. Kéo thả phân loại
10. Kéo thả ghép cặp

## Mini-game definitions

### 1. Gõ chữ cái

- Hiện một chữ A-Z thật lớn.
- Bé bấm phím tương ứng.
- Sai: rung nhẹ nội dung, phát tone thử lại, không mất lượt.
- Đúng: chime ngắn, animation sao, chuyển lượt tiếp theo.
- 10 lượt.

### 2. Gõ số

- Hiện một số 0-9.
- Luật giống game chữ cái.
- 10 lượt.

### 3. Gõ từ ngắn

- Hiện từ 2-4 ký tự không dấu.
- Input được tạo từ keyboard event, không dùng ô text nhỏ.
- Tô đậm ký tự hiện tại.
- Enter không bắt buộc; hoàn thành khi đủ từ.
- 8 lượt.

### 4. Tìm phím đúng

- Câu hướng dẫn kiểu “Hãy bấm chữ M”.
- Ký tự mục tiêu hiển thị kèm icon bàn phím.
- Mục tiêu là nhận biết vị trí phím, không chấm tốc độ.
- 10 lượt.

### 5. Gõ chuỗi phím

- Hiện chuỗi 3-5 ký tự, ví dụ `A S D F`.
- Highlight vị trí đang cần bấm.
- Sai không reset toàn chuỗi; chỉ yêu cầu thử lại ký tự hiện tại.
- 8 lượt.

### 6. Click mục tiêu lớn

- Một mục tiêu lớn xuất hiện ở vị trí ngẫu nhiên an toàn trong play area.
- Click đúng hoàn thành lượt.
- Click nền được tính là một attempt sai nhưng không hiện hình phạt.
- 12 lượt.

### 7. Click đúng hình

- Hiện lời nhắc, ví dụ “Click con mèo”.
- 3 lựa chọn hình lớn.
- Click đúng hoàn thành lượt.
- 10 lượt.

### 8. Rê chuột theo đường

- Bé đưa con trỏ từ điểm bắt đầu qua 4-6 checkpoint tới đích.
- Không yêu cầu giữ chuột.
- Ra ngoài đường không reset; chỉ chưa kích hoạt checkpoint tiếp theo.
- 6 lượt.

### 9. Kéo thả phân loại

- Kéo một vật vào vùng đích phù hợp, ví dụ quả vào giỏ.
- Dùng Pointer Events, không dựa vào HTML5 Drag and Drop.
- Thả sai: vật trở về vị trí ban đầu.
- 8 lượt.

### 10. Kéo thả ghép cặp

- Kéo hình vào cặp tương ứng, ví dụ xe -> bóng xe hoặc vật -> màu/nhóm đúng.
- Dùng cùng primitive kéo thả của game 9.
- 8 lượt.

## Game framework contract

```ts
export type GameId =
  | 'letters'
  | 'numbers'
  | 'words'
  | 'find-key'
  | 'sequence'
  | 'click-target'
  | 'pick-picture'
  | 'mouse-trail'
  | 'drag-sort'
  | 'drag-match';

export type RoundOutcome = {
  correct: number;
  attempts: number;
};

export type MiniGameProps = {
  roundIndex: number;
  totalRounds: number;
  onRoundComplete: (outcome: RoundOutcome) => void;
  speak: (text: string) => void;
};

export type GameDefinition = {
  id: GameId;
  title: string;
  category: 'keyboard' | 'mouse';
  order: number;
  rounds: number;
  intro: string;
  emoji: string;
  component: React.ComponentType<MiniGameProps>;
};
```

`GameShell` sở hữu session state:

- round hiện tại
- danh sách `RoundOutcome`
- progress bar
- nút nghe lại
- phản hồi đúng/sai
- màn hình hoàn thành
- số sao
- gọi lưu progress

Mini-game không tự đọc/ghi localStorage và không tự điều hướng.

## Star scoring

Không chấm tốc độ.

```ts
accuracy = totalCorrect / totalAttempts

1 sao: hoàn thành session
2 sao: accuracy >= 0.75
3 sao: accuracy >= 0.90
```

Nếu `totalAttempts === 0`, trả 1 sao sau khi session hoàn thành để tránh lỗi chia 0.

Best stars của một game chỉ tăng, không giảm khi chơi lại.

## Progress model

LocalStorage key: `tapgo.progress.v1`.

```ts
export type GameProgress = {
  plays: number;
  bestStars: 0 | 1 | 2 | 3;
  completed: boolean;
  lastPlayedAt: string | null;
};

export type ProgressState = {
  version: 1;
  lastGameId: GameId | null;
  games: Record<GameId, GameProgress>;
};
```

Nếu dữ liệu localStorage bị hỏng hoặc parse thất bại, app dùng state mặc định mới thay vì crash.

Không lưu tên, tuổi, dữ liệu cá nhân hay telemetry trong MVP.

## Speech and sound

### Speech

`useSpeech` dùng `window.speechSynthesis` và `SpeechSynthesisUtterance`.

- `lang = 'vi-VN'`
- cancel câu cũ trước khi đọc câu mới
- nếu API không có, `speak()` trở thành no-op
- UI text và icon vẫn đủ để chơi nếu speech không hoạt động

### Feedback sound

Dùng Web Audio API tạo tone ngắn tại runtime để tránh quản lý asset audio.

- đúng: two-tone chime ngắn
- sai: one-tone mềm, âm lượng thấp
- nếu AudioContext không khả dụng, gameplay vẫn tiếp tục bình thường

## UX rules

- Một hành động chính trên mỗi màn hình.
- Target click/kéo tối thiểu 72 x 72 CSS px.
- Font lớn; game prompt là nội dung nổi bật nhất.
- Không dùng màu đỏ toàn màn hình hoặc chữ “Sai”, “Thua”, “Thất bại”.
- Copy sai dùng “Thử lại nhé!”.
- Animation feedback dưới 700 ms.
- Không tự chuyển màn hình khi bé đang thao tác kéo/rê.
- Mọi game có nút Home dễ thấy và nút nghe lại.
- Viewport dưới 900 px hiển thị thông báo “Hãy mở TapGo trên máy tính để luyện bàn phím và chuột.” thay vì cố tối ưu touch.

## Visual system

MVP dùng:

- một bộ design tokens duy nhất cho màu, radius, shadow, spacing, motion
- native emoji cho nội dung động vật/đồ chơi/xe/không gian để tránh asset pipeline ở v1
- cùng card frame và typography để emoji khác chủ đề vẫn nằm trong một style UI thống nhất
- không thêm animation library; dùng CSS transition/keyframes ngắn

## Error handling

- localStorage hỏng: reset về default state.
- localStorage write fail: session vẫn chơi được; bỏ qua persistence cho lần đó.
- speech unavailable/blocked: text + icon vẫn hoạt động.
- audio unavailable: gameplay không bị chặn.
- pointer cancel khi kéo: object quay về start.
- game definition thiếu: quay về Home với thông báo nhẹ thay vì render crash.

## Testing strategy

### Unit

- star calculation
- progress default/load/save/corrupt-data behavior
- path unlock logic
- speech fallback
- game registry order

### Component interaction

Mỗi mini-game có test cho:
- thao tác đúng hoàn thành round
- thao tác sai không nhảy round
- outcome có `correct` và `attempts` chính xác

### Integration

- Home -> Path -> game -> complete -> stars -> localStorage
- Free Play mở được game chưa unlock trong Path
- reload app khôi phục progress
- speech API thiếu không làm crash

## Acceptance criteria

MVP hoàn thành khi:

1. Cả 10 mini-game chơi được trên Chrome/Edge desktop bằng chuột và bàn phím thật.
2. Một session không dùng countdown và thường kết thúc trong khoảng 3-5 phút.
3. Hoàn thành game tạo 1-3 sao và lưu được vào localStorage.
4. Reload giữ lại best stars và trạng thái hoàn thành.
5. Lộ trình unlock tuần tự; Chơi tự do luôn mở cả 10 game.
6. Speech có nút nghe lại và app vẫn dùng được nếu speech unavailable.
7. Sai thao tác không đưa bé vào failure screen.
8. Build production và toàn bộ Vitest test suite pass.
