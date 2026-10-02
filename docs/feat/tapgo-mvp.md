# TapGo MVP Feature Specification

> updated 2026-10-02 · f544718

## Goal

Tạo một web app desktop đơn giản cho trẻ khoảng 6 tuổi làm quen với bàn phím và chuột thông qua 38 mini-game ngắn (12 bài cơ bản + 8 bộ đề gõ nâng cao + 8 bộ chuột nâng cao + 5 nhiệm vụ bắt trộm + 5 trò vui chơi), vui, ít chữ, phản hồi tích cực và không gây áp lực thời gian.

## Product decisions đã chốt

- Nền tảng: desktop/laptop, ưu tiên chuột thật và bàn phím thật; không tối ưu touch/mobile trong MVP.
- Stack: React + Vite + TypeScript.
- Lưu tiến độ: localStorage, không tài khoản, không backend.
- Luyện gõ: A-Z, 0-9, Space/Enter khi cần, và từ tiếng Việt không dấu như `ME`, `BA`, `CON`, `MEO`, `CHO`, `NHA`, `XE`.
- Luyện chuột: click, rê chuột, kéo thả; bài nâng cao thêm click nhiều hình / theo thứ tự / hình nhỏ, nháy đúp và giữ chuột kéo theo đường; cuối lộ trình là 5 nhiệm vụ click chuột “cảnh sát nhí bắt trộm” (không bạo lực: bắt gấu mèo trộm để lấy lại đồ).
- Điều hướng học: Home ưu tiên một CTA `Chơi ngay` để vào Guided Play; vẫn có Lộ trình và Chơi tự do mở toàn bộ game.
- Guided Play: tự chọn bài theo `getRecommendedGameId` (xem Learning path; xong 12 bài cơ bản thì chuyển sang bài nâng cao), chạy quick session tối đa 5 lượt rồi ưu tiên CTA `Bài tiếp theo`. Trong Guided Play, `Bài tiếp theo` mở bài được gợi ý theo cùng logic với `Chơi ngay` (`getRecommendedGameId`), loại trừ bài vừa chơi — chơi lại đã có nút `Chơi lại`; Lộ trình và Chơi tự do giữ bài kế theo thứ tự.
- Phản hồi: hoàn thành bài là thông điệp chính; 1-3 sao là tín hiệu phụ, kèm âm thanh nhẹ và animation ngắn; không dùng thông báo thất bại nặng nề.
- Hướng dẫn: chữ ngắn + icon + giọng đọc.
- Speech: Web Speech API (`speechSynthesis`) với locale `vi-VN`; luôn có nút nghe lại.
- Nhịp chơi: không dùng countdown ép thời gian; Guided Play dùng quick session tối đa 5 lượt, còn Lộ trình/Chơi tự do dùng số lượt đầy đủ của game.
- Chủ đề: trộn động vật, đồ chơi, xe, không gian; giữ cùng hệ thống card, typography, animation và cách trình bày.
- Kiến trúc: Game framework dùng chung + từng mini-game cắm logic riêng.

## Review decisions

### Giữ

`GameShell` là đúng abstraction boundary vì cả 38 game đều cần chung hướng dẫn, tiến độ lượt, phản hồi đúng/sai, tính sao, hoàn thành và lưu tiến độ.

### Sửa

Không dùng `Timer` hiển thị hay countdown. Đây là xung đột với mục tiêu giảm áp lực cho trẻ. Game dùng `roundIndex / totalRounds` và thanh tiến độ theo lượt.

Triển khai theo vertical slice: framework + 1 game bàn phím + 1 game chuột trước, xác nhận toàn bộ luồng từ Home -> chơi -> sao -> lưu localStorage, sau đó mới thêm 8 game còn lại.

## Information architecture

```text
App
├── Home
│   ├── Chơi ngay → Guided Play
│   ├── Xem lộ trình
│   ├── Chơi tự do
│   └── Tiến độ
├── Learning Path
│   └── 38 bài theo thứ tự (12 cơ bản, rồi 8 gõ nâng cao, rồi 8 chuột nâng cao, rồi 5 nhiệm vụ bắt trộm, rồi 5 trò vui chơi)
├── Free Play
│   └── 38 game luôn mở
├── Game
│   └── GameShell + MiniGame
└── Progress
    ├── tổng sao + trạng thái từng game (`StarRating`)
    ├── Gợi ý cho bố mẹ: nút `Chơi <tên bài>` mở bài được gợi ý (`getRecommendedGameId`)
    └── `Bắt đầu lại từ đầu` (cuối trang, cho bố mẹ): hỏi lại một lần rồi xoá hết tiến độ
```

App không cần URL routing trong MVP. `App` giữ một view state nhỏ vì đây là single-user local app và không có nhu cầu deep-link. Game view mang thêm mode `guided | path | free-play` để Guided Play có thể dùng quick session mà không làm thay đổi độ dài đầy đủ của Lộ trình và Chơi tự do.

## Learning path

Trong màn hình Lộ trình, game 1 mở sẵn. Game N được mở khi game N-1 đã hoàn thành ít nhất một lần. Trong Chơi tự do, cả 38 game luôn mở. Từ Home, `Chơi ngay` (và `Bài tiếp theo` trong Guided Play, loại trừ bài vừa chơi) chọn theo thứ tự `getRecommendedGameId` (`src/game/path.ts`): game đầu tiên chưa hoàn thành theo lộ trình (cơ bản trước, rồi gõ nâng cao 1→8, rồi chuột nâng cao 1→8, rồi nhiệm vụ 1→5, rồi vui chơi 1→5) → bài nâng cao (gõ, chuột, nhiệm vụ hoặc vui chơi) đầu tiên chưa đạt 3 sao → game bất kỳ đầu tiên chưa đạt 3 sao → bài nâng cao đầu tiên (`drill-home-row`).

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
11. Phím cách và Enter
12. Đếm rồi bấm số
13. Nâng cao 1 · Hàng phím giữa
14. Nâng cao 2 · Hàng phím trên
15. Nâng cao 3 · Hàng phím dưới
16. Nâng cao 4 · Từ dài
17. Nâng cao 5 · Hai từ
18. Nâng cao 6 · Số và chữ
19. Nâng cao 7 · Câu ngắn
20. Nâng cao 8 · Câu dài và Enter
21. Chuột nâng cao 1 · Click hết các hình
22. Chuột nâng cao 2 · Click theo số
23. Chuột nâng cao 3 · Click hình nhỏ
24. Chuột nâng cao 4 · Nháy đúp chuột
25. Chuột nâng cao 5 · Rê chuột đường dài
26. Chuột nâng cao 6 · Kéo nhiều món
27. Chuột nâng cao 7 · Phân loại hai nhóm
28. Chuột nâng cao 8 · Giữ chuột kéo theo đường
29. Nhiệm vụ 1 · Bắt trộm ở công viên
30. Nhiệm vụ 2 · Đừng bắt nhầm bạn tốt
31. Nhiệm vụ 3 · Tìm trộm đang trốn
32. Nhiệm vụ 4 · Bắt trộm tí hon
33. Nhiệm vụ 5 · Bắt trùm Gấu Mèo
34. Vui chơi 1 · Nổ bóng bay chữ
35. Vui chơi 2 · Câu cá số
36. Vui chơi 3 · Lật thẻ tìm cặp
37. Vui chơi 4 · Cho thú ăn
38. Vui chơi 5 · Ghép tranh

`src/game/types.ts`: `BASIC_GAME_IDS` (1–12), `TYPING_DRILL_IDS` (13–20), `MOUSE_DRILL_IDS` (21–28), `MISSION_IDS` (29–33), `FUN_IDS` (34–38); `ADVANCED_GAME_IDS` = gõ, chuột, nhiệm vụ rồi vui chơi (13–38); `GAME_IDS` = cơ bản rồi nâng cao.

Game mới chỉ nối vào cuối `GAME_IDS` (`PATH_ORDER = GAME_IDS`) để không khoá lại bài của bé đang chơi dở; `normalizeProgress` điền game mới rỗng cho tiến độ cũ. Màn Lộ trình xếp 5 trạm mỗi hàng, số hàng tăng theo số game.

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
- Chuỗi nằm trọn một hàng phím có hình minh hoạ của hàng đó (hàng giữa 🐾 bước chân, hàng trên 🚂, hàng dưới 🐛; chuỗi nhiều hàng 🌈).
- Sai không reset toàn chuỗi; chỉ yêu cầu thử lại ký tự hiện tại.
- 8 lượt.

### 6. Click mục tiêu lớn

- Một mục tiêu lớn xuất hiện ở vị trí ngẫu nhiên an toàn trong play area; mục tiêu đổi mỗi lượt (⭐ 🎈 🦋 🐞 …, kho `CLICK_TARGETS` 13 mục chọn bằng `pickRound`), prompt và `Nghe yêu cầu` đọc “Click vào <tên mục tiêu>”.
- Click đúng hoàn thành lượt.
- Click nền được tính là một attempt sai nhưng không hiện hình phạt.
- 12 lượt.

### 7. Click đúng hình

- Hiện lời nhắc, ví dụ “Click con mèo”.
- 3 lựa chọn hình lớn.
- Click đúng hoàn thành lượt.
- 10 lượt.

### 8. Rê chuột theo đường

- Bé đưa con trỏ từ điểm bắt đầu qua 4-6 checkpoint tới đích. Điểm đầu/đích là một cặp theo chủ đề (🐭→🧀, 🚀→🌙, 🚗→🏠 …, `TRAIL_THEMES`), prompt “Đưa 🐭 tới 🧀”.
- Không yêu cầu giữ chuột.
- Ra ngoài đường không reset và không tính sai; chỉ chưa kích hoạt checkpoint tiếp theo.
- Đi vào một checkpoint phía sau checkpoint kế tiếp (sai thứ tự) tính là một attempt sai và gọi `onRetry` kèm hint chỉ checkpoint cần tới; tiến độ không reset. Đi lại qua checkpoint đã xong không tính sai. Trước khi chạm điểm bắt đầu, đi qua checkpoint khác không tính sai (con trỏ đang nằm sẵn khi mở game, hoặc đang quay về từ đích của lượt trước). Outcome là `{ correct: số checkpoint, attempts: số checkpoint + số lần sai thứ tự }`.
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

### 11. Phím cách và Enter (`space-enter`)

- Mỗi lượt hiện một phím lớn: `🚀 Space` (thanh dài `--key-wide-width` 560px, ≥ 3 lần chiều cao phím) hoặc `📮 Enter`; bé bấm đúng phím. Prompt và `Nghe yêu cầu` đọc “Bấm phím cách” / “Bấm phím Enter”.
- 10 lượt = 5 Space + 5 Enter xáo theo `sessionSeed`, nên mỗi session đủ lượt có cả hai phím (mỗi phím 5 lần).
- Bấm nhầm phím cách khi cần Enter (hoặc ngược lại) là một attempt sai, hint “Thử lại nhé! Tìm phím Enter trên bàn phím nhé.”.
- `useKeySequence` coi Enter là ký tự `'\n'`. Space và Enter chỉ được tính khi chuỗi mong đợi có `' '` hoặc `'\n'`, khi đó cả hai bị `preventDefault` để không kích hoạt nút đang focus. Game khác: Space bị nuốt (`preventDefault`, không tính sai), Enter để nguyên cho trình duyệt.

### 12. Đếm rồi bấm số (`count-keys`)

- Mỗi lượt hiện 1–9 emoji cùng loại (🍎 🐟 ⭐ … kho `COUNT_ITEMS` 10 loại) xếp lưới tối đa 3 × 3, cạnh một phím `?`; bé đếm rồi bấm phím số bằng số lượng (phím số hàng trên hoặc numpad đều cho `event.key` `'1'`…`'9'`).
- Prompt “Có mấy quả táo?”, `Nghe yêu cầu` đọc “Có mấy quả táo? Bấm số đó”. Số lượng (kho `COUNTS` 1–9 = số lượt, chỉ xáo thứ tự) và loại emoji chọn bằng `pickRound`.
- Sai: hint “Thử lại nhé! Đếm lại từng quả táo nhé.”. Assist mức 1 đánh số nhỏ dưới từng emoji, mức 2 hiện đáp án trên phím.
- 9 lượt.

### 13–20. Bộ đề gõ nâng cao (`drill-*`)

Một component dùng chung `createTypingDrillGame(set)` (`src/games/TypingDrillGame.tsx`), dữ liệu 8 bộ trong `DRILL_SETS` (`src/games/drills.ts`). Độ khó nằm ở thứ tự bộ (chuỗi dài nhất không giảm, độ dài trung bình tăng từ bộ 1 đến bộ 8); drill bỏ qua `level`. Mỗi bộ 6 lượt, kho 11–12 mục chọn bằng `pickRound`.

| # | id | Tên | Nội dung | Độ dài (kể cả Space/Enter) |
| --- | --- | --- | --- | --- |
| 13 | `drill-home-row` | Nâng cao 1 · Hàng phím giữa | chỉ A S D F G H J K L | 4–5 |
| 14 | `drill-top-row` | Nâng cao 2 · Hàng phím trên | chỉ Q W E R T Y U I O P | 4–5 |
| 15 | `drill-bottom-row` | Nâng cao 3 · Hàng phím dưới | chỉ Z X C V B N M | 4–5 |
| 16 | `drill-long-words` | Nâng cao 4 · Từ dài | từ không dấu kèm hình (`CHUOI`, `THUYEN`) | 4–6 |
| 17 | `drill-two-words` | Nâng cao 5 · Hai từ | hai từ cách nhau bằng phím cách (`XE DAP`) | 5–8 |
| 18 | `drill-numbers` | Nâng cao 6 · Số và chữ | số + từ (`3 QUA TAO`) | 5–9 |
| 19 | `drill-sentences` | Nâng cao 7 · Câu ngắn | câu ba từ (`BE DI HOC`) | 9–11 |
| 20 | `drill-sentence-enter` | Nâng cao 8 · Câu dài và Enter | câu 3–4 từ kết thúc bằng Enter | 10–14 |

- Mục `{ text, emoji, say }`: `text` là chữ in hoa không dấu / số, `' '` là phím cách, `'\n'` là Enter (chỉ bộ 8); `say` là câu có dấu để đọc. `Nghe yêu cầu` đọc “Gõ: <say>”, bộ 8 thêm “, rồi bấm phím Enter”.
- Chuỗi hiện từng ô phím như `Gõ từ ngắn` (`data-state` done/active/todo, `data-assist` trên ô đang cần bấm); phím cách hiện `␣` (ô rộng, `data-key="space"`), Enter hiện `⏎`, cả hai `role="img"` với nhãn “phím cách” / “phím Enter”. Chuỗi từ 11 phím dùng ô nhỏ hơn (`data-size="compact"`).
- Sai không reset chuỗi; hint gọi tên phím qua `spokenKeyName` (`src/game/retryCopy.ts`), ví dụ “Thử lại nhé! Tìm phím cách trên bàn phím nhé.”. Bấm Enter khi chuỗi có phím cách nhưng chưa tới Enter là một attempt sai.

### 21–28. Bộ chuột nâng cao (`mouse-*`)

Dữ liệu 8 bộ trong `MOUSE_DRILL_SETS` (`src/games/mouseDrills.ts`); registry dựng component theo `kind` bằng 4 factory dùng chung: `createMultiClickGame` (bộ 1–3), `createDoubleClickGame` (bộ 4), `createMouseTrailGame` (bộ 5 và 8; bài 8 cơ bản cũng là `createMouseTrailGame({ trails: TRAILS, checkpointSize: 'medium', hold: false })`), `createMultiDragGame` (bộ 6–7, dùng `usePointerDrag` + `resolveDrop` như game 9–10). Độ khó nằm ở thứ tự bộ; bộ chuột bỏ qua `level`. Mỗi bộ 6 lượt, `category: 'mouse'`; mục của lượt chọn bằng `pickRound` / `shuffleWithSeed` theo `sessionSeed` + `roundIndex`.

| # | id | Tên | Kho | Lượt chơi |
| --- | --- | --- | --- | --- |
| 21 | `mouse-click-many` | Chuột nâng cao 1 · Click hết các hình | 13 hình (`CLICK_TARGETS`) | 3 hình 96px, thứ tự bất kỳ |
| 22 | `mouse-click-order` | Chuột nâng cao 2 · Click theo số | 13 hình (`CLICK_TARGETS`) | 4 / 5 hình 96px gắn số, xen kẽ theo lượt, click số 1 → N |
| 23 | `mouse-click-small` | Chuột nâng cao 3 · Click hình nhỏ | 13 hình (`CLICK_TARGETS`) | 5 hình 56px, thứ tự bất kỳ |
| 24 | `mouse-double-click` | Chuột nâng cao 4 · Nháy đúp chuột | 9 đồ vật (`DOUBLE_CLICK_ITEMS`) | 1 mục tiêu 96px, nháy đúp để mở |
| 25 | `mouse-trail-long` | Chuột nâng cao 5 · Rê chuột đường dài | 8 đường (`LONG_TRAILS`) | 9–12 điểm nhỏ, không giữ nút |
| 26 | `mouse-drag-many` | Chuột nâng cao 6 · Kéo nhiều món | 8 nhóm (`SORT_GROUPS`) | 3 món cùng nhóm vào 1 chỗ |
| 27 | `mouse-drag-groups` | Chuột nâng cao 7 · Phân loại hai nhóm | 9 cặp nhóm (`GROUP_PAIRS`) | 4 món trộn (2 + 2) vào đúng 1 trong 2 chỗ |
| 28 | `mouse-hold-trail` | Chuột nâng cao 8 · Giữ chuột kéo theo đường | 12 đường (`TRAILS` của game 8) | 6–8 điểm, giữ nút trái suốt đường |

- **Click nhiều hình (21–23):** hình đặt vào ô khác nhau của lưới 4×2 trong `SAFE_AREA` (xáo theo seed, không chồng, tối đa 8 hình). Hình đã click chuyển `data-state="done"`; click hết thì xong lượt. Click nền là một attempt sai không kèm hint. Bộ 22: click sai số là attempt sai, hint “Thử lại nhé! Click số X trước nhé.”. Outcome `{ correct: số hình, attempts: số hình + số lần sai }`. `data-assist` trên hình kế tiếp (bộ 22: số cần click). Bộ 22 dùng các hình trong `CLICK_TARGETS` (⭐ 🦋 🍎 …) gắn số, intro “Hãy click các hình theo số, từ số 1 trở đi.”. Prompt “Click hết các hình” / “Click theo số từ 1 đến N”; `Nghe yêu cầu` đọc “Click vào từng hình: <tên các hình>” / “Click các hình theo số, từ số 1 đến số N”. Vị trí lấy từ `targetSlots` (`src/games/mouseLayout.ts`, cùng `MAX_CLICK_TARGETS`, `joinNames`); seed của lượt là `roundSeed` (`src/game/pickRound.ts`).
- **Nháy đúp (24):** `dblclick` trên mục tiêu hoàn thành lượt, outcome `{ correct: 1, attempts: 1 + số lần sai }`; hai click của cú nháy đúp không tính sai (`event.detail > 1` bỏ qua). Click đơn: sau `DOUBLE_CLICK_WINDOW_MS` (500ms) không có click thứ hai thì tính một attempt sai, hint “Thử lại nhé! Bấm nhanh hai lần nhé.”. Click ra ngoài mục tiêu = attempt sai. Prompt “Nháy đúp để mở <tên>”.
- **Rê đường dài (25):** luật như game 8; checkpoint cỡ nhỏ (`data-size="small"` trên `.trail-area`): vùng nhận 68px, chấm 44px (game 8: 104px / 72px).
- **Giữ chuột kéo (28):** bắt đầu bằng nhấn nút trái trên điểm bắt đầu (`pointerdown`, `preventDefault`) hoặc đi vào điểm bắt đầu khi đang giữ nút; checkpoint chỉ tính khi `buttons & 1`. Sau khi đã bắt đầu, nhả nút ở bất kỳ đâu, kể cả ngoài khung (`pointerup` trên `window`, chỉ nghe khi đang giữa đường), hoặc đi vào checkpoint mà không giữ nút là một attempt sai (mỗi lần nhả chỉ tính một lần): tiến độ về điểm bắt đầu, hint “Thử lại nhé! Giữ chặt nút chuột nhé.”. Trước khi bắt đầu, con trỏ tự do đi qua đường không tính sai. `.trail-area[data-hold]` tắt bôi đen (`user-select: none`). Prompt “Giữ chuột kéo 🐭 tới 🧀”.
- **Kéo nhiều món (26–27):** hàng món 96px ở trên, chỗ thả ở dưới; mỗi món thuộc đúng một nhóm (`SORT_GROUPS` không trùng emoji giữa các nhóm), số món chia đều cho các chỗ. Thả đúng: món hiện trong chỗ thả, ô cũ để trống. Thả sai hoặc ra ngoài: món về chỗ cũ, tính một attempt sai. Outcome `{ correct: số món, attempts: số lần thả }`. `data-assist` trên chỗ thả của món kế tiếp; snap theo bán kính như game 9–10. Prompt “Kéo hết vào <chỗ>” / “Kéo mỗi món vào đúng chỗ”.
- Token kích thước trong `theme.css`: `--target-medium` 96px, `--target-small` 56px.

### 29–33. Nhiệm vụ bắt trộm (`mission-*`)

Chủ đề “cảnh sát nhí”: gấu mèo đeo mặt nạ (🦝 `gấu mèo trộm`) lấy trộm đồ ăn, đồ chơi; bé click để bắt, gấu mèo bị bắt biến thành món đồ được lấy lại. Không có vũ khí, không “tiêu diệt”, không đếm giờ. Một factory `createMissionGame(set)` (`src/games/MissionGame.tsx`), dữ liệu trong `MISSION_SETS` (`src/games/missions.ts`) với kho `FRIENDS` (8 bạn tốt 🐰 🐶 🐥 …), `LOOT` (8 món 🍪 💎 🧸 …), `HIDEOUTS` (5 chỗ trốn 🌳 📦 🗑️ 🌿 🧺). Mỗi bộ 6 lượt, `category: 'mouse'`, bỏ qua `level`.

| # | id | Tên | Cảnh | Lượt chơi |
| --- | --- | --- | --- | --- |
| 29 | `mission-park` | Nhiệm vụ 1 · Bắt trộm ở công viên | công viên | 2 / 3 gấu mèo 96px xen kẽ theo lượt |
| 30 | `mission-market` | Nhiệm vụ 2 · Đừng bắt nhầm bạn tốt | chợ | 3 gấu mèo + 2 bạn tốt |
| 31 | `mission-hide` | Nhiệm vụ 3 · Tìm trộm đang trốn | sân sau | 5 chỗ trốn, 2 chỗ có gấu mèo |
| 32 | `mission-small` | Nhiệm vụ 4 · Bắt trộm tí hon | phòng đồ chơi | 4 gấu mèo 56px + 3 bạn tốt 56px |
| 33 | `mission-boss` | Nhiệm vụ 5 · Bắt trùm Gấu Mèo | gác mái | 1 trùm 🦹 cần 3 lần trúng + 3 bạn tốt |

- Vị trí: các nhân vật dùng ô đầu của `targetSlots(MAX_CLICK_TARGETS, seed + 1)`, ô còn lại là chỗ trùm nhảy tới; tổng số nhân vật + số lần nhảy ≤ 8.
- Gấu mèo mang món đồ nhỏ ở góc (`.mission-loot`); bắt xong nút có `data-state="done"` và nhãn “Đã lấy lại <món>”. Click lại món đã lấy, chỗ trốn rỗng hoặc chỗ trốn để nhìn không tính sai.
- Click bạn tốt là một attempt sai, hint “Thử lại nhé! Đó là <bạn>, bạn tốt đấy. Bắt gấu mèo trộm nhé.” (nhiệm vụ 5: “Bắt trùm Gấu Mèo nhé.”). Click nền là attempt sai không hint.
- Nhiệm vụ 3: chỗ trốn (`data-kind="hideout"`, viền nét đứt, nhãn “Tìm trong <chỗ>”) click để mở; có gấu mèo thì hiện gấu mèo để click bắt, rỗng thì mờ đi (`data-state="empty"`, nhãn “<chỗ> không có ai”).
- Nhiệm vụ 5: số trên trùm là số lần trúng còn lại; mỗi lần trúng (chưa đủ) trùm nhảy sang một ô trống khác — chỉ đổi chỗ sau click, không có hẹn giờ.
- Outcome `{ correct: số gấu mèo × số lần trúng cần, attempts: correct + số lần sai }`. `data-assist` trên gấu mèo đang hiện chưa bắt; nhiệm vụ 3 khi chưa thấy gấu mèo thì trên chỗ trốn có gấu mèo.
- Cảnh nền vẽ đất sét 1280×720 `src/assets/art/scene-<park|market|hide|small|boss>.webp` phủ `.click-play-area[data-scene]` (`background-size: cover`); nhân vật vẫn nằm trong đĩa tròn để nổi trên nền. Hình 🦝 🦹 🗑️ 🍪 💎 🌿 trong `src/assets/art/play/`, icon 5 bài trong `src/assets/art/mission-*.webp`.

### 34–38. Công viên vui chơi (`fun-*`)

Năm trò chơi vui, mỗi trò có cảnh nền đất sét riêng, không đếm giờ. Dữ liệu trong `FUN_SETS` (`src/games/funGames.ts`); mỗi bộ 6 lượt, bỏ qua `level`. Registry chọn factory theo `kind`: `pop-keys` → `createPopKeysGame` (`category: 'keyboard'`), `memory` → `createMemoryGame`, `puzzle` → `createPuzzleGame`, `multi-drag` → `createMultiDragGame` (`category: 'mouse'`).

| # | id | Tên | Cảnh | Lượt chơi |
| --- | --- | --- | --- | --- |
| 34 | `fun-balloon` | Vui chơi 1 · Nổ bóng bay chữ | bầu trời | 3 / 4 bóng bay, mỗi quả một chữ (`BALLOON_KEYS`, 19 chữ) |
| 35 | `fun-fishing` | Vui chơi 2 · Câu cá số | ao cá | 3 / 4 con cá 🐟 🐠 🐡, mỗi con một số 1–9 |
| 36 | `fun-memory` | Vui chơi 3 · Lật thẻ tìm cặp | bàn chơi | 3 / 4 cặp thẻ (6 / 8 thẻ) từ 10 bạn thú `MEMORY_ITEMS` |
| 37 | `fun-feed` | Vui chơi 4 · Cho thú ăn | trang trại | 4 món ăn cho 2 bạn thú (`FEED_GROUPS`, 6 cặp `FEED_PAIRS`) |
| 38 | `fun-puzzle` | Vui chơi 5 · Ghép tranh | — | 4 mảnh của 1 trong 6 tranh `PUZZLE_PICTURES` |

- **Bóng bay / câu cá (34–35):** hình nổi nhẹ lên xuống (`tapgo-float`, đứng yên khi giảm chuyển động) tại ô `targetSlots`, mỗi hình mang một phím (`.pop-key`); bóng đổi màu bằng `hue-rotate`. Bấm phím có trên hình (không phân biệt hoa/thường, theo thứ tự bất kỳ) thì hình đổi thành ✨ / 🪣. Phím không có trên hình là một attempt sai, hint “Thử lại nhé! Bấm một chữ có trên quả bóng nhé.”; bấm lại phím đã xong và phím cách không tính. Outcome `{ correct: số hình, attempts: số hình + số lần sai }`; `data-assist` trên hình đầu tiên chưa xong.
- **Lật thẻ (36):** thẻ úp mặt sau `play/card-back`; click lật hai thẻ, giống nhau thì thành `data-state="matched"`. Cặp sai vẫn mở cho tới click kế tiếp (không hẹn giờ). Outcome `memoryOutcome(cặp, lần sai)` = `{ correct: cặp, attempts: cặp + max(0, lần sai − cặp) }` vì bé cần lật thử để nhớ; hint “Nhớ chỗ các hình đã lật nhé.” chỉ khi số lần sai vượt số cặp. `data-assist` trên thẻ cùng cặp với thẻ đang mở, hoặc thẻ đầu tiên chưa ghép.
- **Cho thú ăn (37):** dùng lại `MultiDragGame` với `prompt` “Cho mỗi bạn món bạn thích” và `scene: 'farm'` (`.drag-game[data-scene]`); luật thả như game 27.
- **Ghép tranh (38):** khay 2×2 mảnh (mỗi mảnh một góc tranh 640×640, `background-size: 200%`) xáo theo seed; khung 2×2 có tranh mờ (`.puzzle-ghost`, opacity 0.25). Thả đúng ô thì mảnh nằm vào khung, sai thì về khay, hint “Thử lại nhé! Nhìn hình mờ để tìm chỗ của mảnh này nhé.”; snap theo bán kính như game 9–10. Outcome `{ correct: 4, attempts: số lần thả }`; `data-assist` trên ô của mảnh kế tiếp trong khay.
- Hình vẽ: cảnh 1280×720 `src/assets/art/scene-<sky|pond|farm|memory>.webp`, 6 tranh 640×640 `src/assets/art/puzzle-1..6.webp`, icon `src/assets/art/fun-*.webp`, hình trong lượt 🥬 🍖 🍯 🌾 ✨ 🪣 🐡 🎣 và mặt sau thẻ trong `src/assets/art/play/`.

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
  | 'drag-match'
  | 'space-enter'
  | 'count-keys'
  | 'drill-home-row' | 'drill-top-row' | 'drill-bottom-row' | 'drill-long-words'
  | 'drill-two-words' | 'drill-numbers' | 'drill-sentences' | 'drill-sentence-enter'
  | 'mouse-click-many' | 'mouse-click-order' | 'mouse-click-small' | 'mouse-double-click'
  | 'mouse-trail-long' | 'mouse-drag-many' | 'mouse-drag-groups' | 'mouse-hold-trail'
  | 'mission-park' | 'mission-market' | 'mission-hide' | 'mission-small' | 'mission-boss'
  | 'fun-balloon' | 'fun-fishing' | 'fun-memory' | 'fun-feed' | 'fun-puzzle';

export type RoundOutcome = {
  correct: number;
  attempts: number;
};

export type MiniGameProps = {
  roundIndex: number;
  totalRounds: number;
  onRoundComplete: (outcome: RoundOutcome) => void;
  onRetry?: (hint?: string) => void;
  speak: (text: string) => void;
  assistLevel?: 0 | 1 | 2;
  sessionSeed?: number;
  level?: 0 | 1 | 2;
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
- nút nghe lại cách chơi và nút `Xem cách chơi` / `Ẩn cách chơi` (guide)
- lượt ôn lại (review) sau khi hết lượt chính
- phản hồi đúng/sai
- màn hình hoàn thành
- số sao
- gọi lưu progress

Mini-game không tự đọc/ghi localStorage và không tự điều hướng. `GameShell` giữ retry count và truyền `assistLevel` xuống mini-game để tăng trợ giúp sau lỗi mà không làm mỗi game tự xây một state machine riêng. Lượt ôn lại không được ghi thêm vào `outcomes` nên không thay đổi scoring của lượt gốc. Lượt ôn chỉ có ở Lộ trình và Chơi tự do; quick session của Guided Play (có `roundLimit`) không sinh lượt ôn để giữ đúng tối đa 5 lượt.

`GameShell` tạo `sessionSeed` (số nguyên 32-bit không dấu) một lần mỗi session và tạo seed mới khi `Chơi lại`; mở game khác cũng là session mới. Mini-game chọn mục của lượt bằng `pickRound(pool, roundIndex, sessionSeed)` (`src/game/pickRound.ts`): kho được hoán vị xác định theo seed (mulberry32) rồi lấy `perm[roundIndex % pool.length]`, nên trong một session không lặp mục khi kho ≥ số lượt. Lượt ôn nhận cùng `sessionSeed` và `roundIndex` nên dùng lại đúng mục. Thiếu seed thì `pickRound` trả `pool[roundIndex % pool.length]` như thứ tự cũ. `shuffleWithSeed(items, seed)` dùng cùng PRNG để xáo vị trí đáp án.

`level` (mức khó) do `GameShell` suy từ `bestStars` đã lưu của game (`levelFromStars`, `src/game/level.ts`): 0–1 sao → 0 (dễ), 2 sao → 1 (vừa), 3 sao → 2 (khó); không thêm trường lưu. Guided Play (có `roundLimit`) luôn là mức 0. Thiếu `level` = mức 0. Game dùng mức khó: Click đúng hình (mức 1: thêm 1 lựa chọn cùng chủ đề thành 4 lựa chọn; mức 2: 4 lựa chọn đều cùng chủ đề), Kéo thả ghép cặp (mức 1 đổi 1 bóng mồi khác nhóm sang cùng nhóm với hình kéo, mức 2 đổi cả hai; nhóm trong `MATCH_GROUPS`), Gõ chuỗi phím (kho riêng 3 / 4 / 5 phím theo mức, `SEQUENCES_BY_LEVEL`). Game khác bỏ qua `level`.

Kho và cách chọn mục (mọi game chọn lượt bằng `pickRound`, trừ `space-enter` xáo 5 Space + 5 Enter bằng `shuffleWithSeed`):

| Game | Kho | Lượt | Ghi chú |
| --- | --- | --- | --- |
| letters | 14 chữ (`A M S L P E B C N T I F W Z`) | 10 | rời với find-key, hợp lại đủ A–Z |
| numbers | 10 (0–9) | 10 | chỉ xáo thứ tự |
| words | 28 từ không dấu kèm emoji nghĩa | 8 | có từ 4 chữ |
| find-key | 12 chữ | 10 | không trùng letters |
| sequence | 3 kho × 12 chuỗi (3/4/5 phím theo `level`) | 8 | kèm hình theo hàng phím |
| click-target | 13 mục tiêu (`CLICK_TARGETS`) | 12 | vị trí ngẫu nhiên trong `SAFE_AREA` |
| pick-picture | 32 lượt / 4 chủ đề | 10 | xáo vị trí đáp án theo seed |
| mouse-trail | 12 đường, 7 cặp điểm đầu/đích | 6 | 4–6 checkpoint giữa |
| drag-sort | 18 | 8 | xáo thứ tự 2 zone theo seed |
| drag-match | 20 cặp | 8 | bóng mồi theo `level` |
| space-enter | 5 Space + 5 Enter | 10 | mỗi phím 5 lần |
| count-keys | số lượng 1–9, 10 loại emoji | 9 | số lượng chỉ xáo thứ tự |
| drill-* (8 bộ) | 11–12 mục mỗi bộ (`DRILL_SETS`) | 6 | không dùng `level` |
| mouse-* (8 bộ) | 8–13 mục mỗi bộ (`MOUSE_DRILL_SETS`) | 6 | không dùng `level`; vị trí hình / thứ tự món xáo theo seed |
| mission-* (5 bộ) | 8 bạn tốt, 8 món đồ, 5 chỗ trốn (`MISSION_SETS`) | 6 | không dùng `level`; vị trí, bạn tốt, món đồ xáo theo seed |
| fun-* (5 bộ) | 19 chữ, 9 số, 10 bạn thú, 6 cặp thú ăn, 6 tranh (`FUN_SETS`) | 6 | không dùng `level`; phím, vị trí, thẻ, mảnh tranh xáo theo seed |

Assist dùng một cơ chế chung cho cả 38 game: mỗi game gắn `data-assist="1"` hoặc `data-assist="2"` lên chính target thật (phím/ký tự đích, mục tiêu click, hình đúng, checkpoint kế tiếp, drop zone đúng). CSS chung trong `app.css` vẽ trợ giúp theo attribute này.

- Level 0: chưa có lỗi, không trợ giúp.
- Level 1 (sau 2 lần sai liên tiếp): target được viền nổi bật, guide tự mở và hint cụ thể được đọc bằng giọng.
- Level 2 (sau 3 lần sai liên tiếp): target phóng to thêm.
- Kéo thả: bán kính snap cơ bản 24 px, cộng thêm 16 px mỗi level assist.

Session Guided Play 5 lượt vẫn tính là hoàn thành bài: lưu sao, đánh dấu `completed` và mở khoá bài kế trong Lộ trình như session đầy đủ.

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

Reset: ở cuối màn Tiến độ, khung “Dành cho bố mẹ” có nút `🔄 Bắt đầu lại từ đầu` (bị tắt khi chưa có game nào được chơi, tức mọi `plays` = 0). Bấm nút mở bước xác nhận “Xoá hết sao và bài đã hoàn thành? Xoá rồi không lấy lại được.” với `Không xoá` (được focus sẵn, quay lại) và `Xoá hết, bắt đầu lại`. Xác nhận thì `App` đặt progress về `createDefaultProgress()` (effect lưu đè `tapgo.progress.v1`), màn Tiến độ hiện 0 sao và báo “Đã xoá tiến độ. Bé bắt đầu lại từ bài 1 nhé.” (`role="status"`); Lộ trình khoá lại từ game 2.

Không lưu tên, tuổi, dữ liệu cá nhân hay telemetry trong MVP.

## Speech and sound

### Speech

`useSpeech` dùng `window.speechSynthesis` và `SpeechSynthesisUtterance`.

- `lang = 'vi-VN'` và gán `voice` là giọng tiếng Việt đầu tiên trong `getVoices()` (lang bắt đầu bằng `vi`); không gán thì Chrome/Edge đọc bằng giọng mặc định (thường là tiếng Anh)
- danh sách giọng còn rỗng (Chrome nạp bất đồng bộ): giữ câu mới nhất, đọc khi có `voiceschanged`; unmount thì bỏ câu đang chờ
- máy không có giọng tiếng Việt: im lặng thay vì đọc bằng giọng nước ngoài (Edge có sẵn giọng `vi-VN` online; Chrome trên Windows cần cài gói giọng nói tiếng Việt)
- cancel câu cũ trước khi đọc câu mới
- nếu API không có, `speak()` trở thành no-op
- UI text và icon vẫn đủ để chơi nếu speech không hoạt động

### Feedback sound

Dùng Web Audio API tạo tone ngắn tại runtime để tránh quản lý asset audio.

- đúng: two-tone chime ngắn
- sai: one-tone mềm, âm lượng thấp
- nếu AudioContext không khả dụng, gameplay vẫn tiếp tục bình thường

## UX rules

- Một hành động chính trên mỗi màn hình; Home ưu tiên `Chơi ngay` và màn hình kết quả ưu tiên `Bài tiếp theo`.
- Target click/kéo nhìn thấy tối thiểu 72 x 72 CSS px; hit area có thể lớn hơn để giảm yêu cầu chính xác ở trẻ mới dùng chuột. Ngoại lệ có chủ đích ở bộ chuột nâng cao: hình 56px (game 23 và 32) và chấm 44px trong vùng nhận 68px (game 25).
- Guided Play đọc intro một lần khi vào bài; sau hai lỗi liên tiếp mở hướng dẫn và đọc lại hint cụ thể.
- Trợ giúp tăng dần: hint → guide + speech → target/drop zone nổi bật hoặc dễ trúng hơn (xem `data-assist` ở phần Game framework contract).
- Font lớn; game prompt là nội dung nổi bật nhất: prompt tối thiểu 44 px, lớn hơn tiêu đề bài (28 px). Game click và rê chuột cũng có prompt.
- Mỗi game có nút `Nghe yêu cầu` (`ListenButton`) đọc mục tiêu của lượt hiện tại; header có nút `Nghe lại cách chơi` đọc intro.
- Không dùng màu đỏ toàn màn hình hoặc chữ “Sai”, “Thua”, “Thất bại”.
- Copy sai dùng “Thử lại nhé!”.
- Animation feedback dưới 700 ms.
- Ăn mừng màn kết quả (confetti, sao hiện lần lượt) tổng ≤ 1.5 s, `pointer-events: none` nên không chặn `Bài tiếp theo`, và hiển thị tĩnh khi `prefers-reduced-motion`.
- Mascot và hình trang trí không che target; trang trí nền ẩn khi viewport < 1240 px.
- Không tự chuyển màn hình khi bé đang thao tác kéo/rê.
- Mọi game có nút Home dễ thấy và nút nghe lại.
- Viewport dưới 900 px hiển thị thông báo “Hãy mở TapGo trên máy tính để luyện bàn phím và chuột.” thay vì cố tối ưu touch.

## Visual system

MVP dùng:

- một bộ design tokens duy nhất cho màu, radius, shadow, spacing, font size, motion, khai báo trong `src/styles/theme.css` (ví dụ `--radius-sm/lg`, `--font-title/prompt/target`, `--space-sm/md/lg`, `--motion-pop/shake`); `app.css` chỉ dùng token
- icon game, nhân vật dẫn dắt và hình trong lượt chơi là ảnh vẽ phong cách đất sét (owner yêu cầu 2026-10-02), nạp bằng `import.meta.glob` trong `src/game/art.ts`, không thêm thư viện hay bước build; tên nào không có ảnh thì giữ emoji. Icon game và mascot: WebP 256px (mascot 320px) trong `src/assets/art/<gameId|mascot-mood>.webp` (`GameArt`, `Mascot`), nền xanh pastel cho game bàn phím, cam đào pastel cho game chuột. Hình trong lượt chơi: dữ liệu game vẫn ghi emoji, `Emoji` thay bằng `src/assets/art/play/e-<code point hex, bỏ FE0F>.webp` (192px, nền trong suốt, cỡ 1.2em theo font của ô, `alt` là emoji)
- cùng card frame và typography để emoji khác chủ đề vẫn nằm trong một style UI thống nhất
- không thêm animation library; dùng CSS transition/keyframes ngắn
- màu theo vai trò: `--color-keyboard` / `--color-mouse` (mỗi màu có `-soft` cho nền, `-strong` cho chữ/viền), `--color-reward` cho sao, `--color-primary` cho CTA chính; `.game-shell`, `.game-card`, trạm Lộ trình và sticker Tiến độ mang `data-category="keyboard|mouse"`, CSS chọn màu qua alias `--color-category(-soft/-strong)`; màu gốc chỉ dùng trang trí, chữ đạt tương phản ≥ 4.5:1
- font bo tròn tự host `@fontsource-variable/nunito` (token `--font-family`, fallback system-ui), không request ra domain ngoài
- nhân vật dẫn dắt `Mascot` (Mèo Tapi, ảnh vẽ 3 trạng thái, fallback 🐱 😸 😺, `aria-hidden`, trạng thái `idle | cheer | encourage` do `GameShell` điều khiển) nằm trong `CoachBubble` — bong bóng lời duy nhất của màn game thay intro + hint + lượt ôn + guide (ưu tiên hint > review > guide > intro), nút ❓ `Xem cách chơi` 72 px cạnh bong bóng
- phím mục tiêu vẽ giống phím thật (`--key-depth`), phím Space rộng `--key-wide-width`; hiệu ứng đúng là lớp phủ `.stage-burst` của `.game-stage` (≤ 600 ms)
- vùng chơi luôn nằm trọn trong màn hình (`.game-shell:has(> .game-stage)` cao `100vh`, stage `1fr`)

## Error handling

- localStorage hỏng: reset về default state.
- localStorage write fail: session vẫn chơi được; bỏ qua persistence cho lần đó.
- speech unavailable/blocked: text + icon vẫn hoạt động.
- audio unavailable: gameplay không bị chặn.
- pointer cancel khi kéo: object quay về start.
- game definition thiếu: không thể xảy ra — registry là `Record<GameId, …>` nên mọi `GameId` đều có definition, App không có nhánh fallback.

## Testing strategy

### Unit

- star calculation — `src/game/scoring.test.ts`
- progress default/load/save/corrupt-data, một game key lỗi không xoá cả tiến độ, localStorage ném lỗi — `src/game/progress.test.ts`
- path unlock logic và `getRecommendedGameId` — `src/game/path.test.ts`
- speech fallback và cancel — `src/hooks/useSpeech.test.ts`
- feedback tone dùng lại một AudioContext — `src/hooks/useFeedbackTone.test.ts`
- game registry order, drill đăng ký từ `DRILL_SETS`, bộ chuột đăng ký từ `MOUSE_DRILL_SETS` với `category: 'mouse'` — `src/game/registry.test.ts`
- kho bộ đề nâng cao: ≥ 10 mục không trùng, ký tự hợp lệ, bộ 1–3 đúng hàng phím, độ dài tăng dần, chỉ bộ 8 có Enter — `src/games/drills.test.ts`
- kho bộ chuột nâng cao: tên, intro có dấu, 6 lượt, ≥ 8 mục không trùng, điểm đường nằm trong vùng chơi, nhóm kéo không chung hình, độ khó tăng từ bộ 1 đến bộ 8 — `src/games/mouseDrills.test.ts`
- theme tokens và kích thước tối thiểu — `src/styles/app.test.ts`

### Component interaction

Mỗi mini-game có test (`src/games/*Game.test.tsx`) cho:
- thao tác đúng hoàn thành round
- thao tác sai không nhảy round
- outcome có `correct` và `attempts` chính xác
- kéo thả: snap theo bán kính và pointer cancel đưa vật về chỗ cũ — `DragSortGame.test.tsx`, `DragMatchGame.test.tsx`
- rê chuột sai thứ tự gọi `onRetry`; đường dài; giữ chuột: nhả giữa đường (cả ngoài khung) về điểm bắt đầu — `MouseTrailGame.test.tsx`
- click nhiều hình: ô không chồng, theo số, hint số cần click, 4/5 hình gắn số — `MultiClickGame.test.tsx`
- nháy đúp: không tính sai hai click của cú đúp, hint click đơn, click ngoài, huỷ hint khi unmount — `DoubleClickGame.test.tsx`
- kéo nhiều món: một chỗ / hai chỗ, thả ngoài tính sai, assist chỗ thả — `MultiDragGame.test.tsx`

Framework và UI chung:
- nhiệm vụ bắt trộm: số nhân vật vừa ô, có cảnh và hình vẽ, bắt trộm → món đồ, bạn tốt tính sai kèm hint, mở chỗ trốn không tính sai, trùm nhảy 3 chỗ khác nhau — `src/games/MissionGame.test.tsx`
- công viên vui chơi: nổ bóng theo thứ tự bất kỳ, phím không có trên bóng tính sai kèm hint, câu cá bằng số — `PopKeysGame.test.tsx`; cặp sai mở tới click kế tiếp, `memoryOutcome`, hint chỉ khi sai quá số cặp — `MemoryGame.test.tsx`; ghép 4 mảnh, thả sai ô về khay — `PuzzleGame.test.tsx`; registry theo `kind` và đủ hình vẽ cho mọi cảnh, tranh, hình trong lượt — `src/games/funGames.test.ts`, `src/game/registry.test.ts`
- `data-assist` 0/1/2 trên target thật của cả 38 game — `src/games/assist.test.tsx`
- `Nghe yêu cầu` đọc mục tiêu lượt — `src/components/ListenButton.test.tsx`
- GameShell: assist level theo số lần sai, đọc intro/hint, guide, lượt ôn, không ôn trong quick session — `src/game/GameShell.test.tsx`
- Progress: gợi ý `Chơi <bài>`, sao, reset phải xác nhận / huỷ được / tắt khi chưa chơi — `src/screens/ProgressScreen.test.tsx`; reset xoá localStorage và khoá lại Lộ trình — `src/App.test.tsx`

### Integration (`src/App.test.tsx`)

- Home -> Path -> game -> complete -> stars -> localStorage
- Guided Play: quick session 1/5, `Bài tiếp theo` theo gợi ý; Lộ trình 1/10
- Free Play mở được game chưa unlock trong Path
- reload app khôi phục progress
- speech API thiếu không làm crash

## Acceptance criteria

MVP hoàn thành khi:

1. Cả 38 mini-game chơi được trên Chrome/Edge desktop bằng chuột và bàn phím thật.
2. Một session không dùng countdown; Guided Play mặc định tối đa 5 lượt, còn Lộ trình/Chơi tự do giữ số lượt đầy đủ của game.
3. Hoàn thành game tạo 1-3 sao và lưu được vào localStorage.
4. Reload giữ lại best stars và trạng thái hoàn thành.
5. Lộ trình unlock tuần tự; Chơi tự do luôn mở cả 38 game. Tổng sao tối đa 114 (`gameRegistry.length * 3`).
6. Speech có nút nghe lại và app vẫn dùng được nếu speech unavailable.
7. Sai thao tác không đưa bé vào failure screen.
8. Build production và toàn bộ Vitest test suite pass.
