# TapGo v3 · Giao diện hấp dẫn trẻ + bài tập phong phú

> Plan thực thi. Baseline: commit `1d88402` (master; 116 test pass, `tsc` sạch — số test đo ở phiên soạn plan, đếm tĩnh được 92 `it()` + các case `it.each`). Nguồn điều tra: ảnh chụp qua CDP (Chrome headless, port 9222, dev server 5173) của Home, Lộ trình, Chơi tự do, Tiến độ, game Gõ chữ cái / Click mục tiêu / Kéo thả phân loại, trạng thái “Thử lại nhé!” và màn hoàn thành; đọc code `src/**`, spec `docs/feat/tapgo-mvp.md`, `docs/plan/fix-audit-sep30.md`, `docs/plan/v2-guided-play.md`. Rà soát lại toàn bộ claim với code ngày 2026-09-30 (mục [Kết quả rà soát](#kết-quả-rà-soát-2026-09-30)).

## Cách dùng plan này

- **Dev bắt đầu từ plan này.** `fix-audit-sep30.md` chỉ còn T44 (QA thủ công trên Chrome/Edge thật), dời sang sau phase B (xem Quyết định).
- Làm theo thứ tự phase (A → B → C → D → E; owner đã chốt làm D ngày 2026-09-30). Trong phase làm P1 trước P2 trước P3, trừ khi task ghi phụ thuộc.
- Mỗi task một commit (`feat:` / `fix:` / `test:` / `docs:` / `refactor:`), không kèm trailer model-credit. Commit file plan cùng commit của task.
- Trước khi commit: `npx tsc --noEmit && npm test`; task đụng deps/build chạy thêm `npm run build`.
- Trạng thái ở dòng tiêu đề task: `[ ]` chưa nhận · `[~]` đang làm (kèm `— đang làm: <lane>`) · `[x]` xong. Nhận task bằng cách sửa đúng chuỗi `### [ ] Vxx`; không sửa task `[~]` của người khác.
- Task có tiêu chí đo trên trình duyệt (CDP `getBoundingClientRect`, ảnh chụp) chưa được ghi “xong” nếu chưa đo: ghi `unverified — cần đo runtime` kèm lệnh đo.
- Sau mỗi phase: chụp lại cùng bộ màn hình qua CDP ở 1366×768 và 1280×720, so với baseline.
- Quyết định cuối cùng về UX rule / Visual system ghi vào `docs/feat/tapgo-mvp.md` và cập nhật stamp `updated` của file đó trong cùng commit.

## Phụ thuộc giữa các task

- V01 → V05 (V01 tạo bong bóng lời `CoachBubble`, V05 gắn nhân vật vào đó).
- V02 → V04, V06, V07, V09 (dùng token vai trò và `data-category`).
- V05 → V08, V10 (trạng thái mascot).
- V11 → V12, V13, V14 (dùng `pickRound` và `sessionSeed`).
- V12 → V14 (mức khó cần kho đủ lớn).
- V02, V06, V11 → V15, V16 (màu nhóm, kiểu phím, `pickRound`); làm D sau khi xong C.
- V15 → V16: thứ tự thêm vào `GAME_IDS` là cố định (`space-enter` là game 11, `count-keys` là game 12), đảo thứ tự sẽ đổi vị trí trên Lộ trình.
- Mọi task → V17.

## Hiện trạng (FACT, đã đối chiếu code)

### Giao diện

- Toàn app một màu nhấn (`--color-primary #4f46e5`) trên nền kem phẳng (`--color-bg #fff8e8`), card trắng giống hệt nhau (`src/styles/theme.css`). `GameDefinition.category` có sẵn (`src/game/types.ts`) nhưng chưa có `data-category` nào trong DOM/CSS.
- Không có nhân vật dẫn dắt; emoji chỉ là icon nhỏ trong card (`.game-card-emoji` 64px, chữ 36px).
- Lộ trình là lưới card 2 cột (`.game-grid`, `LearningPathScreen.tsx`), dùng chung `GameCard` với Chơi tự do; bài khoá là nút xám `🔒 Xong bài trước để mở`.
- Màn game (`GameShell.tsx`): header + thanh lượt + `game-intro` + nút `Xem cách chơi` (72px) + guide + `retry-hint` + `review-message` xếp dọc phía trên vùng chơi. `Nghe yêu cầu` nằm trong từng game.
- Vừa màn hình: T47 (commit `b298a59`) chỉ cố định `100vh` cho màn có `.trail-area` / `.click-play-area`; ở 1366×768 khi hiện hint đáy vùng chơi xuống 817px, hiện cả guide là 911px (ghi chú T47). 3 game kéo thả / chọn hình và 5 game phím dùng `min-height: 460px` không có ràng buộc viewport → ước tính tràn ở 768px khi mở guide (**chưa đo**; ảnh CDP baseline cho thấy vật kéo thả bị cắt ở Kéo thả phân loại).
- Phím mục tiêu (`KeyTargetStage`, `.key-target`): ô vuông 180px viền tím, không giống phím thật.
- Click mục tiêu: một ⭐ (`.click-target-visual` 72px) trong vùng nét đứt, 12 lượt y hệt, prompt cố định `Click vào ngôi sao`.
- Màn hoàn thành: 🎉 96px + chữ lớn + `StarRating`; không có hiệu ứng ăn mừng.
- Tiến độ: dải tím `N / 30 sao` + danh sách game; không có gì để “sưu tầm”.
- Hiệu ứng đúng/sai chạy ở `.game-stage` (`tapgo-pop` / `tapgo-shake`). MiniGame được render với `key={roundIndex-reviewCycle}` nên **target của lượt vừa đúng bị unmount ngay lập tức** khi sang lượt mới — hiệu ứng gắn vào target sẽ không kịp hiện.

### Bài tập

| Game | Kho | Lượt | Chọn mục |
| --- | --- | --- | --- |
| letters | 10 (`A M S L P E B C N T`) | 10 | `LETTERS[roundIndex % 10]` |
| numbers | 10 (0–9) | 10 | `% length` |
| words | 8 (`ME BA CON MEO CHO NHA XE CA`) | 8 | `% length` |
| find-key | 10 (`Q G H K R U V Y D O`) | 10 | `% length` |
| sequence | 8 | 8 | `% length` |
| click-target | 1 mục tiêu ⭐, vị trí ngẫu nhiên | 12 | `Math.random` trong `SAFE_AREA` |
| pick-picture | 10 | 10 | `% length`, đáp án cố định chỗ theo lượt |
| mouse-trail | 6 | 6 | `% length` |
| drag-sort | 8 | 8 | `% length`, zone đúng luôn render trước |
| drag-match | 8 | 8 | `% length`, mồi nhử khác hẳn nhóm |

- Chơi lại y hệt; Guided (5 lượt, `roundLimit=5`, không có lượt ôn) luôn thấy mục 0–4 (chữ cái luôn A M S L P).
- Không có mức khó; `assistLevel` chỉ làm dễ hơn.
- I và Z không xuất hiện ở game nào; F, J, W chỉ có trong chuỗi, X chỉ có trong từ `XE`.
- Gõ từ: không có hình minh hoạ nghĩa, không có từ 4 chữ.
- `useKeySequence` bỏ qua mọi phím có `key.length !== 1` → **Enter không dùng được**; Space **đã** được nhận nếu chuỗi mong đợi có `' '` (các game hiện tại không có nên Space bị bỏ qua và chặn default — test T20). Spec dòng 14 có “Space/Enter khi cần”.
- Lượt ôn: GameShell giữ nguyên `roundIndex`, chỉ tăng `reviewCycle` → lượt ôn tự động lấy lại đúng mục của lượt gốc nếu cách chọn mục chỉ phụ thuộc `roundIndex` + seed.
- Test ghim nội dung: `FindKeyGame.test` (TARGETS không trùng LETTERS), `SequenceTypingGame.test` (3–5 ký tự, không trùng WORDS, có chuỗi > 3), `MouseTrailGame.test` (4–6 checkpoint giữa, polyline của `TRAILS[2]`), `ListenButton.test` (lượt 0: `Bấm chữ A`, `Gõ từ ME`…), `ClickTargetGame.test` (`SAFE_AREA`), `App.test` (Chơi tự do 10 `game-card`, `2 / 30 sao`, Lộ trình: nút `Gõ số` disabled).

## Ràng buộc phải giữ (FACT, spec + test)

- Spec `docs/feat/tapgo-mvp.md` § UX rules (dòng 273–284): một hành động chính mỗi màn; target nhìn thấy ≥ 72×72px; prompt ≥ 44px và lớn hơn tiêu đề bài (28px); animation feedback < 700ms; không đỏ toàn màn hình, không chữ “Sai/Thua/Thất bại”; copy sai “Thử lại nhé!”; không countdown; không tự chuyển màn khi đang kéo/rê; viewport < 900px hiện desktop gate.
- Spec § Visual system (dòng 286–293): một bộ token trong `theme.css`, `app.css` chỉ dùng token; emoji native, không asset pipeline ở v1; không animation library; có `prefers-reduced-motion`.
- `src/styles/app.test.ts` ghim: `.action-button`, `.game-card button`, `.guide-toggle`, `.listen-button`, nút header ≥ 72px; `.click-target` 104px + visual 72px; `.picture-option` ≥ 96px; `.game-heading h1` 28px; `--font-prompt: clamp(44px`; cấm `border-radius: <n>px` (dùng token hoặc `50%`); keyframe `tapgo-pop` / `tapgo-shake` trên `.game-stage.is-correct` / `.is-retry`; selector chính xác `.game-shell:has(.trail-area, .click-play-area)` + `grid-template-rows: auto auto 1fr`; cấm `min-height: 500px`, `body { min-width }`, `color: white`. Test ghim *hành vi* (kích thước tối thiểu, prompt ≥ 44px, có reduced-motion) giữ nguyên; test ghim *giá trị trình bày* được cập nhật cùng commit đổi giá trị đó.
- Tiến độ lưu ở `tapgo.progress.v1`: không đổi key/version, không đổi tên/xoá `GameId`; game mới chỉ thêm vào **cuối** `GAME_IDS` (`PATH_ORDER = GAME_IDS`; chèn giữa sẽ khoá lại bài của người đang chơi dở). `normalizeProgress` tự điền game thiếu nên thêm game cuối không làm mất tiến độ cũ.
- Accessibility đã có (T27): nút bài khoá là `button disabled` với `aria-label` “…: xong bài trước để mở”; sao là `role="img"` `aria-label="N sao"`.

## Quyết định đã chốt trong plan

- **Bố cục trước màu sắc.** Sửa việc vùng chơi bị đẩy khỏi màn hình (V01) trước mọi trang trí — vì · bé không thấy vật để kéo thì đẹp mấy cũng hỏng · bác bỏ: làm theme trước (phải chỉnh layout lần hai) · mở lại nếu: có cách khác sửa phần còn mở của T47.
- **Bong bóng lời tách khỏi nhân vật.** V01 tạo `CoachBubble` (chỉ chữ, thay intro + hint + guide); V05 gắn mascot vào bong bóng đó — vì · V01 ở phase A không được phụ thuộc task phase B · bác bỏ: guide dạng lớp phủ trong vùng chơi (che target, vi phạm “mascot/trang trí không che target”) · mở lại nếu: đo thấy bong bóng vẫn đẩy vùng chơi khỏi 768px.
- **Hiệu ứng thành công đặt ở `GameShell`, không ở target.** Target bị unmount ngay khi lượt đúng (`key={roundIndex-reviewCycle}`), nên nổ sao / phím lún phải là lớp phủ của `.game-stage` (không bị key theo lượt) — vì · không đổi luồng chuyển lượt · bác bỏ: trễ chuyển lượt ~300ms để target kịp diễn (đổi flow GameShell + test, cần owner) · mở lại nếu: owner muốn bé thấy target “ăn mừng” trước khi sang lượt.
- **Nhân vật dẫn dắt dùng emoji + CSS**, không vẽ asset — vì spec cấm asset pipeline ở v1 · bác bỏ: SVG/Lottie mascot (thêm pipeline + thư viện) · mở lại nếu: owner muốn nhân vật riêng có bản quyền.
- **Font bo tròn tự host có hỗ trợ tiếng Việt** (một gói `@fontsource-variable/*`, vd Baloo 2 hoặc Nunito, subset `vietnamese` + `latin`), fallback system-ui — vì chữ bo tròn tăng cảm giác thân thiện nhiều nhất trên mỗi đơn vị công, và tự host thì không gọi domain ngoài · bác bỏ: Google Fonts CDN (request ra ngoài; spec không nói offline, nên đây là lựa chọn an toàn chứ không phải ràng buộc) · mở lại nếu: owner không muốn thêm dependency.
- **Chia 26 chữ cho 2 game thay vì cho Gõ chữ cái cả 26.** Letters 14 chữ + FindKey 12 chữ, rời nhau, hợp lại đủ A–Z — vì · giữ quy tắc T24 (FindKey không dạy lại chữ của Letters, có test) · cả hai kho > số lượt (10) nên xáo có tác dụng · bác bỏ: Letters 26 chữ (vỡ test T24, FindKey mất vai trò) · mở lại nếu: owner muốn Gõ chữ cái dạy trọn bảng chữ.
- **Làm phong phú bài tập trước bằng xáo trộn + mở rộng kho, không thêm GameId** (phase C) — vì giải quyết “chơi lại y hệt” mà không đụng dữ liệu tiến độ · game mới để ở phase D.
- **Làm phase D: thêm 2 game vào cuối lộ trình (game 11–12), spec đổi “10 mini-game” → “12 mini-game”** — owner chốt 2026-09-30 · vì · luyện Space/Enter (spec dòng 14 có nhưng chưa game nào dạy) và nối đếm với bấm số · thêm vào cuối `GAME_IDS` nên tiến độ cũ không mất, bé đã xong 10 bài thì mở luôn bài 11 · bác bỏ: chèn vào giữa lộ trình (khoá lại bài của bé đang chơi dở); gộp Space/Enter vào game hiện có (đổi luật game cũ, vỡ test) · mở lại nếu: QA T44 lượt 2 thấy Enter vẫn kích hoạt nút trên trình duyệt thật.
- **Tổng sao tự tăng 30 → 36.** `ProgressScreen` tính `gameRegistry.length * 3`, nên không sửa code, chỉ sửa test ghim `/ 30 sao` và `toHaveLength(10)`. Hai game mới đều nhóm `keyboard` (tỉ lệ 7 phím / 5 chuột) — chấp nhận vì bài chuột đã được làm phong phú ở V12–V13.
- **T44/G16 lượt 2 (QA thủ công trên Chrome/Edge thật) dời sang sau phase B** — vì QA giao diện sắp thay là công bỏ đi · bác bỏ: chạy T44 trước làm baseline (ảnh CDP trong plan này đã là baseline hình ảnh) · mở lại nếu: owner cần kết quả giọng đọc tiếng Việt ngay. Đã ghi vào `fix-audit-sep30.md` T44 và `v2-guided-play.md` G16.

## Owner đã chốt

- 2026-09-30 · **Làm phase D** (Space/Enter tên lửa, Đếm rồi bấm số): thêm vào cuối lộ trình (game 11–12), spec đổi từ “10 mini-game” sang “12 mini-game”. Không còn câu hỏi mở cho owner.

## Tổng quan

| Mã | Task | Pri | Effort | Area |
| --- | --- | --- | --- | --- |
| V01 | Vùng chơi luôn nằm trọn trong màn hình (cả 10 game) | P1 | M | layout |
| V02 | Bảng màu vui theo vai trò + màu theo nhóm | P1 | S | theme |
| V03 | Font bo tròn tiếng Việt | P1 | S | theme |
| V04 | Nền và card sinh động | P2 | S | theme |
| V05 | Nhân vật dẫn dắt (emoji mascot) | P1 | M | component |
| V06 | Phím mục tiêu giống phím thật | P1 | S | component |
| V07 | Lộ trình dạng đường đi | P2 | M | screen |
| V08 | Màn hoàn thành ăn mừng | P1 | S | screen |
| V09 | Tiến độ thành “bộ sưu tập” | P3 | M | screen |
| V10 | Phản hồi đúng/sai giàu hình ảnh (lớp phủ ở shell) | P2 | S | shell |
| V11 | `sessionSeed` + helper `pickRound` | P1 | S | framework |
| V12 | Mở rộng kho 10 game + xáo vị trí đáp án | P1 | M | content |
| V13 | Chủ đề hoá game chuột | P2 | M | content |
| V14 | Mức khó theo tiến độ | P3 | M | framework |
| V15 | Game mới 11: Space/Enter tên lửa | P2 | M | game |
| V16 | Game mới 12: Đếm rồi bấm số | P3 | S | game |
| V17 | Cập nhật spec, index, CHANGELOG + QA T44/G16 lượt 2 | P1 | S | docs |

## Phase A — Nền tảng hình ảnh

### [x] V01 · Vùng chơi luôn nằm trọn trong màn hình (cả 10 game)

- Vấn đề: T47 chỉ cố định `100vh` cho 2 game chuột; khi hint + guide cùng mở, sàn `min-height: 320px` thắng (817/911px ở 768). 8 game còn lại (`.typing-game`, `.picture-game`, `.drag-game` `min-height: 460px`) chưa có ràng buộc viewport; ảnh baseline cho thấy vật kéo thả bị cắt.
- Làm:
  - Component mới `src/components/CoachBubble.tsx`: một bong bóng lời thay cho `game-intro` + `retry-hint` + `review-message` + `game-guide` (ưu tiên hiển thị: hint > review > guide > intro). Giữ `role="status"` cho hint/review (test GameShell tìm theo text/role).
  - `Xem cách chơi` thành nút icon cạnh nút 🔊 trong header hoặc cạnh bong bóng, vẫn ≥ 72px, giữ class `.guide-toggle` và `aria-expanded` (test đang ghim).
  - Áp `height: 100vh` + stage `1fr` cho mọi `.game-shell` đang chơi (không chỉ 2 game chuột); game phím/kéo thả dùng `min-height` theo `min(460px, 100%)` thay cho sàn cứng. Cập nhật regex `.game-shell:has(...)` trong `app.test.ts` theo selector mới.
- Xong khi: ở 1366×768 và 1280×720, với hint + guide cùng mở, đáy vùng chơi (và vật kéo) ≤ `innerHeight` cho cả 10 game (đo CDP `getBoundingClientRect`, ghi số đo vào task); `app.test.ts` cập nhật tương ứng; test GameShell về guide/hint/review pass.
- Kết quả: đo CDP (iframe 1366×768 và 1280×720 trong Chrome port 9222, dev server 5181; mỗi game gây 1 lần sai để hiện hint rồi bấm ❓ mở guide): cả 10 game đáy `.game-stage` = 744/768 và 696/720, mọi target/listen/drop zone ≤ đáy stage, card không tràn (`scrollHeight ≤ clientHeight`), trang không cuộn (`scrollHeight = innerHeight`); vật kéo ở 2 game kéo thả đáy 644/768 và 620/720 (đo lại sau rebase lên V02 + V03, font Nunito đã tải; trước: 817/911px ở 768 với game chuột). Selector mới `.game-shell:has(> .game-stage)` (màn kết quả không bị ép 100vh); `.drag-stage` bỏ `min-height: 330px`, padding card 32→24px, padding dọc shell khi chơi 40→24px. Lệch plan: khi hint và guide cùng mở (sau 2 lần sai), bong bóng hiện cả hai dòng thay vì chỉ hint — test “opens guidance after two retries” cần guide hiện cùng hint, và nút ❓ phải luôn có tác dụng thấy được; vẫn vừa màn hình theo số đo trên. Nút `Xem cách chơi` thành nút tròn ❓ 72px cạnh bong bóng, tên truy cập qua `aria-label`.

### [x] V02 · Bảng màu vui theo vai trò + màu theo nhóm

- Thêm token vai trò trong `theme.css`: `--color-keyboard` (cam/san hô) và `--color-mouse` (xanh ngọc), mỗi màu có `-soft` (nền) và `-strong` (chữ/viền); `--color-reward` (vàng sao); giữ `--color-primary` cho CTA chính.
- Thêm `data-category={definition.category}` trên `.game-shell` (GameShell) và `.game-card` (GameCard); CSS chọn màu qua `[data-category="keyboard"]` / `"mouse"`, không viết màu cứng trong `app.css`.
- Chữ trắng trên cam/xanh ngọc sáng thường không đạt 4.5:1 → nền màu nhóm dùng `-soft` + chữ `--color-text`/`-strong`; chỉ dùng chữ trắng trên `-strong`.
- Xong khi: tương phản chữ/nền ≥ 4.5:1 cho mọi cặp token dùng cho chữ (ghi tỉ lệ vào task); `index.html` `theme-color` vẫn khớp `--color-bg`.
- Kết quả: token `--color-keyboard` `#fb923c` / `-soft` `#ffedd5` / `-strong` `#c2410c`, `--color-mouse` `#2dd4bf` / `-soft` `#ccfbf1` / `-strong` `#0f766e`, `--color-reward` `#fbbf24`; alias `--color-category(-soft/-strong)` mặc định = primary, đổi theo `[data-category="keyboard"|"mouse"]` trong `theme.css`. `app.css` dùng alias cho viền `.game-card`, nền `.game-card-emoji`, `.progress-track` (soft) / `.progress-fill` (strong). Tương phản (WCAG): `--color-text` trên keyboard-soft 14.05, mouse-soft 14.29, reward 9.64; keyboard-strong trên surface 5.18, bg 4.89, keyboard-soft 4.52; mouse-strong trên surface 5.47, bg 5.17, mouse-soft 4.86; chữ trắng trên keyboard-strong 5.18, mouse-strong 5.47. Màu gốc `--color-keyboard` (2.26 trên trắng) / `--color-mouse` (1.86) chỉ dùng trang trí (viền card), không dùng cho chữ. Đo CDP (dev server 5182): 10 `game-card` có `data-category` đúng (5 keyboard viền `rgb(251,146,60)`, 5 mouse `rgb(45,212,191)`); `.game-shell` Gõ chữ cái fill `rgb(194,65,12)` / track `rgb(255,237,213)`, Click mục tiêu fill `rgb(15,118,110)` / track `rgb(204,251,241)`; `theme-color` `#fff8e8` = `--color-bg`.

### [x] V03 · Font bo tròn tiếng Việt

- Thêm một gói `@fontsource-variable/*` (subset `vietnamese` + `latin`), import trong `main.tsx`, khai báo `--font-family` trong `theme.css`; `html` trong `app.css` dùng token thay cho danh sách system-ui cứng.
- Xong khi: dấu tiếng Việt hiển thị đúng trên mọi màn (so ảnh CDP); `npm run build` pass và `dist/` chứa file font; tab Network không có request ra domain ngoài.
- Kết quả: `@fontsource-variable/nunito` 5.3.0 (trục wght 200–1000, đủ các weight 650–900 đang dùng; Baloo 2 chỉ tới 800). CDP (vite 5183) ở Home, Lộ trình, Chơi tự do, Tiến độ, game Gõ chữ cái: `font-family` tính ra `"Nunito Variable"`, `document.fonts.check` với toàn bộ chữ trên màn = true, trình duyệt chỉ tải 3 file `latin`, `latin-ext`, `vietnamese` (woff2, cùng origin), 0 request ra domain ngoài. Build pass, `dist/assets/` có 5 file `nunito-*-wght-normal.woff2`. Lệch plan: `index.css` của gói khai báo cả `cyrillic`/`cyrillic-ext` (gói không có CSS theo từng subset) nên 2 file đó vẫn nằm trong `dist/` nhưng không bao giờ được tải nhờ `unicode-range`; chỉ import kiểu normal, không italic.

### [x] V04 · Nền và card sinh động

- Nền: gradient nhẹ + vài hình trang trí emoji mờ cố định (☁️ ⭐ 🎈) ở rìa, `pointer-events: none`, `aria-hidden`, không động khi `prefers-reduced-motion`.
- Card: viền dày bo tròn (radius từ token), bóng “nổi” kiểu nút đồ chơi, nhấn xuống khi hover/active (≤ `--motion-fast`); màu theo `data-category` (V02).
- Xong khi: không trang trí nào chồng lên target/vùng chơi (kiểm ở 1280×720); token mới nằm trong `theme.css`.
- Kết quả: `BackgroundDecor` (6 emoji ☁️ ⭐ 🎈 tĩnh ở rìa trái/phải, `position: fixed`, `pointer-events: none`, `aria-hidden`, không animation) render trong `App` ngoài `DesktopGate`; body thêm 2 gradient `--color-mouse-soft` / `--color-keyboard-soft`. Card: viền 4px `--color-category`, `--radius-lg`, bóng đồ chơi `0 var(--toy-depth) 0 var(--color-category)`, hover lún `--toy-depth-hover`, active lún hết, transition `--motion-fast` (180ms), card khoá không lún. Token mới trong `theme.css`: `--toy-depth` 6px, `--toy-depth-hover` 3px, `--decor-size` 40px, `--decor-inset` 12px, `--decor-opacity` 0.35. Lệch plan: đo ở 900px thấy rãnh bên hẹp làm emoji chồng lên header/card → ẩn trang trí khi viewport < 1240px. Đo CDP (iframe đúng kích thước, Home + Lộ trình/Tiến độ/Chơi tự do cuộn từng 300px + 10 game mở guide, 23 lần kiểm mỗi cỡ): 1366×768 0 chồng lấn, khe nhỏ nhất 86px; 1280×720 0 chồng lấn, khe 43px; 1240×720 0 chồng lấn, khe 23px; 1239×720 trang trí ẩn.

## Phase B — Nhân vật và phản hồi

### [x] V05 · Nhân vật dẫn dắt (emoji mascot)

- Component `Mascot` (một emoji, vd 🐱 “Mèo Tapi”) gắn vào `CoachBubble` (V01); trạng thái `idle | cheer | encourage` do `GameShell` điều khiển (đúng → cheer, `onRetry` → encourage, copy giữ “Thử lại nhé!” từ `retryCopy.ts`); Home có lời chào (không thêm nút, `Chơi ngay` vẫn là hành động chính).
- Chỉ dùng CSS keyframes (nảy, vẫy), mỗi animation < 700ms, tắt khi reduced-motion. Mascot `aria-hidden`; lời thoại đã có trong bong bóng.
- Xong khi: test component cho 3 trạng thái; mascot không che target (nằm ngoài vùng chơi); không thêm dependency.
- Kết quả: `src/components/Mascot.tsx` (🐱 idle / 😸 cheer / 😺 encourage, `aria-hidden`) nằm bên trái chữ trong `CoachBubble`; `GameShell` suy trạng thái từ `feedbackState` (đúng → cheer, sai → encourage, còn hint → vẫn encourage, hết hiệu ứng → idle) và `data-moving` chạy animation khi có phản hồi: `tapgo-mascot-bounce` `--motion-pop` 360ms, `tapgo-mascot-wave` `--motion-shake` 420ms, tắt bởi rule reduced-motion chung. Home: mèo + lời chào “Chào con, mình là Mèo Tapi! Bấm Chơi ngay để bắt đầu nhé!” thay dòng phụ cũ, bỏ 🐱 khỏi hàng emoji hero, không thêm nút. Test: `Mascot.test.tsx` (3 trạng thái + moving), GameShell “drives the mascot”, `app.test.ts` ghim animation dùng token motion. Đo CDP sau rebase lên `730459a` (V06), hint + guide cùng mở: cả 10 game đáy `.game-stage` 744/768 và 696/720, card không tràn, trang không cuộn, vật kéo đáy 644/768 và 620/720; đáy mascot cách đỉnh `.game-stage` 28px ở mọi game (nảy −10px vẫn ngoài vùng chơi). Home vừa 768/720 không cuộn, lời chào cách nút `Chơi ngay` 30px. Không thêm dependency.

### [x] V06 · Phím mục tiêu giống phím thật

- `.key-target`: vẽ phím có mặt trên + cạnh dưới (box-shadow nhiều lớp) theo màu nhóm bàn phím (V02). Bỏ ý “phím lún khi bấm đúng” trên chính phím (phím bị unmount ngay khi đúng — xem Quyết định); cảm giác lún do lớp phủ V10 đảm nhận.
- Có thể áp cùng kiểu cho ô chữ `.typing-sequence span` để game từ/chuỗi đồng bộ.
- Xong khi: `--font-target` giữ ≥ 92px; `data-assist` vẫn nằm trên chính phím; style assist level 1/2 vẫn nhìn thấy trên phím mới.
- Kết quả: token mới `--key-depth` 10px, `--key-depth-sm` 6px, `--shadow-key-drop`. `.key-target` = mặt trên gradient `--color-surface` → `--color-category-soft`, viền + cạnh dưới `--color-category-strong`; `.typing-sequence span` cùng kiểu (cạnh 6px: xám khi chờ, màu nhóm khi active, xanh khi done). Box-shadow của phím đè vòng assist cũ nên assist trên phím chuyển sang `outline: 8px` `--color-primary-soft` + viền `--color-primary`. Đo CDP (vite 5186, 1366×757) Gõ chữ cái: `font-size` 92px, phím 180×180, viền/cạnh `#c2410c` (keyboard-strong); assist 1 (2 lần sai) viền `#4f46e5` + outline 8px `#e8e7ff`; assist 2 (3 lần sai) thêm nền `#e8e7ff`, scale 1.08 (194×194); `data-assist` nằm trên `.key-target`. Gõ chuỗi: active/done/todo đúng màu cạnh, assist 1/2 hiện trên ô active (level 2 giữ nền `--color-primary-soft` nhờ rule riêng đặt sau `data-state`). Không có hiệu ứng lún (thuộc V10).

### [~] V10 · Phản hồi đúng/sai giàu hình ảnh (lớp phủ ở shell) — đang làm: lane-color

- Đúng: `GameShell` render lớp phủ `.stage-burst` (vài ⭐/emoji bằng CSS, `pointer-events: none`, `aria-hidden`) bên trong `.game-stage` — phần tử này không nằm dưới `key` theo lượt nên sống qua lúc chuyển lượt; kéo dài ≤ 600ms, cùng chime hiện có.
- Sai: giữ `tapgo-shake` ở `.game-stage` (spec: “rung nhẹ nội dung”) + mascot `encourage`; không đổi màu nền.
- Giữ tên keyframe `tapgo-pop` / `tapgo-shake` (test đang ghim); `onAnimationEnd` của stage vẫn chỉ nhận event của chính stage (test “ignores animation end events bubbling from children”).
- Xong khi: `.game-stage.is-correct` / `.is-retry` vẫn có animation; tổng thời lượng < 700ms; reduced-motion không hiện burst.

### [x] V08 · Màn hoàn thành ăn mừng

- Confetti CSS (emoji rơi, 1 lần, < 700ms mỗi hạt, tối đa ~1.5s tổng, `pointer-events: none`), sao hiện lần lượt, mascot cheer; `Bài tiếp theo` vẫn là nút chính duy nhất nổi bật.
- Spec chỉ giới hạn *animation feedback* < 700ms; hiệu ứng ăn mừng màn kết quả là quy tắc mới → ghi vào spec § UX rules trong V17 (“ăn mừng màn kết quả ≤ 1.5s, không chặn nút, tĩnh khi reduced-motion”).
- Xong khi: test hiện có của màn kết quả pass; bấm được `Bài tiếp theo` ngay khi confetti đang rơi; reduced-motion hiển thị tĩnh.
- Kết quả: `Confetti` (14 emoji, `aria-hidden`, `position: fixed`, `pointer-events: none`) rơi 1 lần bằng token mới `--motion-celebrate: 650ms`, delay tối đa 780ms → kết thúc 1430ms; 3 sao của `.game-result` hiện lần lượt (delay 0/180/360ms, không ảnh hưởng `ProgressScreen`); mascot cheer cạnh 🎉; reduced-motion ẩn confetti và bỏ animation sao. CDP 1366×768 và 1280×720: ở 200ms `elementFromPoint` tâm `Bài tiếp theo` trúng nút, 14 hạt đang chạy; ở 1550ms còn 0 animation, 0 hạt hiện; `scrollHeight` = viewport; 1 nút chính.

### [x] V07 · Lộ trình dạng đường đi

- Component mới `PathStation` cho `LearningPathScreen`; **giữ `GameCard` cho Chơi tự do** (App.test đếm 10 `game-card` ở Chơi tự do).
- Đường zigzag các “trạm” tròn lớn (emoji game + số thứ tự + sao), trạm khoá hiện 🔒 thay nút xám dài; trạm gợi ý (`getRecommendedGameId`) có mascot đứng cạnh.
- Trạm là `button`; trạm khoá `disabled` với `aria-label` “<tên bài>: xong bài trước để mở”, trạm mở `aria-label` “Chơi <tên bài>” (giữ hành vi T27 và selector `/Gõ số/` của App.test).
- Xong khi: 10 trạm vừa màn 1366×768 hoặc cuộn dọc mượt; target trạm ≥ 72px; `App.test` “opens the learning path” pass không đổi assertion.
- Kết quả: `PathStation` mới (`li` có `data-category`, `data-state="done|open|locked"`, `data-recommended`; `button` tròn 104px viền + bóng màu category, huy hiệu số thứ tự, tên bài + `StarRating` bên dưới); trạm khoá hiện 🔒, `disabled`, aria-label “<tên bài>: xong bài trước để mở”; trạm mở “Chơi <tên bài>”; trạm gợi ý (`getRecommendedGameId`) có vòng sáng reward + `Mascot` (cheer) đứng bên trái. `LearningPathScreen` xếp 10 trạm rắn bò 2 hàng × 5 zigzag trên khung `aspect-ratio 1000/420`, đường SVG (nền `--color-primary-soft`, đoạn đã tới `--color-reward`, vạch trắng). `GameCard`/Chơi tự do giữ nguyên. Test mới `LearningPathScreen.test` (10 trạm, trạm khoá 🔒 + aria, mascot chỉ ở trạm gợi ý, trạm xong có sao); App.test pass không đổi. Đo CDP (vite 5187, 1366×757, tiến độ mẫu 3 bài xong): khung đường 1056×444, trạm 104×104, 10 trạm vừa màn (scrollHeight 757 = viewport, không tràn ngang), trạm 4 gợi ý có mascot, trạm khoá opacity 1 (nền `#f7f7fb`, viền `#cfd3dc`, 🔒 0.7), tiến độ mặc định: mascot cạnh trạm 1 không tràn khung, 9 trạm khoá.

### [x] V09 · Tiến độ thành “bộ sưu tập”

- Mỗi game hoàn thành mở một “sticker” emoji lớn trong album; game chưa xong hiện sticker mờ; tổng sao hiển thị như hũ sao nhưng giữ nguyên chuỗi `N / 30 sao` (App.test ghim). Chỉ đọc từ `ProgressState` hiện có, không thêm trường lưu.
- Xong khi: `ProgressScreen.test` và App.test “shows total best stars” pass; gợi ý cho bố mẹ giữ nguyên.
- Kết quả: `ProgressScreen` — hũ sao `.star-jar` (viền + phần đầy `--color-reward`, chiều cao đầy = tổng sao / tổng sao tối đa, `aria-hidden`) cạnh chuỗi `N / 30 sao` giữ nguyên; danh sách 10 bài thành album 5 cột, mỗi `li` có `data-category` + `data-state="collected|missing"`, sticker tròn 96px emoji 56px nghiêng ±, nền `--color-category-soft`; chưa xong = viền nét đứt, `grayscale(1)`, `opacity 0.4`. Token mới `--shadow-sticker`. Chỉ đọc `ProgressState` (không thêm trường lưu). Test mới: sticker collected/missing + chuỗi `3 / 30 sao`; `ProgressScreen.test`, App.test pass (117 test). Đo CDP (vite 5189, 1366×757, tiến độ mẫu 3 bài/7 sao): `7 / 30 sao`, hũ đầy 23%, sticker xong bàn phím nền `#ffedd5` / chuột `#ccfbf1`, filter none; chưa xong `grayscale(1)` 0.4; card 198×236, không tràn ngang, trang cuộn dọc (961px) như trước; gợi ý cho bố mẹ giữ nguyên.

## Phase C — Bài tập phong phú (không đổi GameId)

### [~] V11 · `sessionSeed` + helper `pickRound` — đang làm: lane-layout

- `GameShell` tạo seed bằng `useState(() => …)` một lần mỗi session, tạo seed mới khi `Chơi lại` (`restart`); truyền `sessionSeed?: number` qua `MiniGameProps`.
- Helper `src/game/pickRound.ts`: `pickRound(pool, roundIndex, seed)` hoán vị kho theo seed (PRNG xác định, vd mulberry32) rồi lấy `perm[roundIndex % length]`. Lượt ôn tự dùng lại đúng mục vì GameShell giữ `roundIndex`. Thiếu seed → `pool[roundIndex % length]` (test cũ như `ListenButton.test` không phải sửa).
- Xong khi: unit test `pickRound` (xác định theo seed; không lặp trong một session khi kho ≥ số lượt; thiếu seed = thứ tự cũ); test GameShell: lượt ôn nhận cùng `sessionSeed` + `roundIndex`; cập nhật contract `MiniGameProps` trong spec.

### [ ] V12 · Mở rộng kho 10 game + xáo vị trí đáp án

- letters 14 chữ + find-key 12 chữ, rời nhau, hợp lại đủ A–Z (có I, Z, F, J, W, X); test T24 “không trùng” giữ nguyên, thêm test “hợp lại đủ 26 chữ”.
- numbers: kho chỉ có 10 chữ số = số lượt → chỉ xáo thứ tự (miễn tiêu chí “kho > số lượt”).
- words 20–30 từ không dấu **kèm emoji nghĩa** (🐟 CA, 🐔 GA, 🐄 BO, 🦆 VIT, 🐘 VOI…), có từ 4 chữ; sequence thêm chuỗi, vẫn 3–5 ký tự và không trùng WORDS (test hiện có).
- pick-picture ~30 mục chia đều 4 chủ đề, xáo vị trí đáp án theo seed; drag-sort xáo thứ tự 2 zone theo seed (test dùng `data-testid` nên không phụ thuộc thứ tự); drag-match ~20 cặp; mouse-trail 10–12 đường (chữ U, bậc thang, dọc), mỗi đường vẫn 4–6 checkpoint giữa.
- Xong khi: mỗi game (trừ numbers, click-target) có kho > số lượt; test dùng seed cố định; test ràng buộc kho (FindKey không trùng Letters, độ dài chuỗi, số điểm đường, polyline `TRAILS[2]`) vẫn đúng hoặc được viết lại theo luật mới trong cùng commit.

### [ ] V13 · Chủ đề hoá game chuột

- click-target đổi mục tiêu mỗi lượt (🎈 🦋 🐞 🪐 …) chọn bằng `pickRound`, prompt + `Nghe yêu cầu` đọc đúng mục tiêu; sửa `intro` trong `registry.ts` (đang là “Hãy click vào ngôi sao.”) thành câu chung.
- mouse-trail có điểm đầu/đích theo cặp (🐭→🧀, 🚀→🌙, 🚗→🏠); sequence gắn hình (ASDF = 🐾 bước chân).
- Xong khi: prompt đọc đúng theo mục tiêu (`ListenButton.test` cập nhật cho click-target); `aria-label="Mục tiêu"` và kích thước 104/72px giữ nguyên (test ghim).

### [ ] V14 · Mức khó theo tiến độ

- Suy mức khó từ `bestStars` hiện có (không thêm trường lưu): 0–1 sao → dễ, 2 → vừa, 3 → khó. Truyền `level?: 0 | 1 | 2` qua `MiniGameProps`. `GameShell` luôn truyền mức dễ khi có `roundLimit` (Guided Play).
- pick-picture 3→4 lựa chọn với mồi nhử cùng nhóm; drag-match bóng giống nhau hơn; sequence 3→5 phím.
- Xong khi: test cho từng mức; test “bé chưa có sao không bao giờ gặp mức khó”; test Guided luôn mức dễ.

## Phase D — Game mới (owner đã chốt 2026-09-30)

Chung cho V15, V16:

- GameId mới chỉ **nối vào cuối** `GAME_IDS` trong `src/game/types.ts`, đúng thứ tự V15 rồi V16; thêm entry trong `registry.ts` (`category: 'keyboard'`, `rounds`, `intro`, `emoji`, `component`). Không đổi key `tapgo.progress.v1`.
- Game dùng `pickRound` + `sessionSeed` (V11), kiểu phím V06, màu nhóm V02, `CoachBubble` V01; tự có lượt ôn, Guided 5 lượt, trợ giúp `assistLevel` như game phím khác.
- Test phải sửa khi thêm mỗi game: `App.test` (Chơi tự do `toHaveLength(10)` → 11/12; `2 / 30 sao` → `/ 33` rồi `/ 36`), `ProgressScreen.test` (`toHaveLength(10)`), `registry.test`, `ListenButton.test` (thêm prompt lượt 0 của game mới); thêm test `loadProgressFrom` với state cũ chỉ có 10 game → game mới được điền rỗng, 10 game cũ giữ nguyên.
- Mỗi game có `src/games/<Tên>Game.test.tsx` theo spec § test mini-game (dòng 318) và mẫu test của game phím hiện có.
- Xong khi (chung): vùng chơi vừa 1366×768 và 1280×720 như V01 (đo CDP); `npx tsc --noEmit && npm test && npm run build` pass; spec `docs/feat/tapgo-mvp.md` có mục mô tả game mới trong cùng commit.

### [ ] V15 · Game mới 11: Space/Enter tên lửa (`space-enter`)

- Luật: mỗi lượt hiện một phím lớn — `Space` (thanh dài, 🚀 bay lên) hoặc `Enter` (📮 gửi thư); bé bấm đúng phím. 10 lượt, xáo theo seed, cả hai loại đều xuất hiện ≥ 3 lần mỗi session (không để 10 lượt toàn Space).
- Sửa `useKeySequence`: nhận `event.key === 'Enter'` thành ký tự mong đợi `'\n'`; khi chuỗi mong đợi có `'\n'` hoặc `' '` thì `preventDefault` để không kích hoạt nút đang focus (cùng lý do T20). Game khác không mong đợi Enter → hành vi cũ giữ nguyên (test T20 pass không sửa).
- Hiển thị/đọc: nhãn `Space` / `Enter` trên phím; prompt + `Nghe yêu cầu` đọc “Bấm phím cách” / “Bấm phím Enter”. Phím Space vẽ rộng (≥ 3 lần chiều cao) nhưng vẫn ≥ 72px.
- Xong khi: test hook “Enter được nhận khi mong đợi”, “Enter không click nút đang focus trong game”, “game cũ vẫn bỏ qua Enter”; test game đúng/sai; phần chung ở trên.

### [ ] V16 · Game mới 12: Đếm rồi bấm số (`count-keys`)

- Luật: hiện 1–9 emoji cùng loại (🍎🍎🍎) xếp lưới dễ đếm (tối đa 3 hàng × 3), bé bấm phím số bằng số lượng. 9 lượt (kho 1–9 = số lượt, chỉ xáo thứ tự như numbers); emoji đổi theo lượt bằng `pickRound`.
- Dùng lại `KeyTargetStage`; `targetLabel` đọc “Có mấy quả táo? Bấm số đó”. Phím số hàng trên và numpad đều cho `event.key` là `'1'`…`'9'` nên `useKeySequence` nhận cả hai (thêm test numpad).
- Assist: level 1 đánh số nhỏ dưới từng emoji, level 2 hiện đáp án trên phím (như `data-assist` các game phím khác).
- Xong khi: test đúng/sai/assist; test không có lượt nào 0 hoặc > 9 emoji; phần chung ở trên.

## Phase E — Đóng

### [ ] V17 · Cập nhật spec, index, CHANGELOG + QA T44/G16 lượt 2

- `docs/feat/tapgo-mvp.md`: Visual system (token vai trò, `data-category`, font, mascot, `CoachBubble`), UX rule mới cho ăn mừng màn kết quả (V08), contract `MiniGameProps` (`sessionSeed`, `level`), định nghĩa kho/chọn mục của từng game đã đổi, “10 mini-game” → “12 mini-game” (dòng 7 và tiêu chí nghiệm thu dòng 343), tổng sao 36, Space/Enter trong `useKeySequence`, stamp `updated`.
- `docs/index.md`: chuyển plan này sang Done plans khi đóng. `CHANGELOG.md` mục `[Unreleased]` (Added/Changed theo Keep a Changelog, không mint version).
- Chạy T44/G16 lượt 2 (QA thủ công Chrome/Edge thật) trên giao diện mới; đóng T44 trong `fix-audit-sep30.md` và G16 trong `v2-guided-play.md`.
- Xong khi: `npm run build` + toàn bộ test pass; ảnh CDP sau/trước đính vào plan; plan chuyển sang `docs/plan/done/`.

## Kết quả rà soát 2026-09-30

Đối chiếu từng claim của bản plan đầu với code tại `1d88402` (đọc tĩnh, không chạy app). Các sửa đã áp vào các mục ở trên.

| Mã | Claim / task bản đầu | Kết luận | Bằng chứng | Đã sửa |
| --- | --- | --- | --- | --- |
| FACT UI | 1 màu nhấn, card giống nhau, lưới 2 cột, phím ô vuông, ⭐ 72px, màn kết quả tĩnh, `0 / 30 sao` | ĐÚNG | `theme.css`, `app.css` `.game-grid` `.key-target` `.click-target-visual`, `GameShell.tsx`, `ProgressScreen.tsx:30` | thêm chi tiết `data-category` chưa có |
| FACT UI | Vật kéo thả bị cắt ở 1366×768 (trùng T47) | MỘT PHẦN | T47 `[x]` (`b298a59`) chỉ sửa 2 game chuột; game kéo thả không có ràng buộc viewport | V01 mở rộng cho cả 10 game |
| V01 | Guide dạng lớp phủ trong vùng chơi | SAI hướng | lớp phủ che target | đổi sang `CoachBubble` |
| V01 | Dùng chung bong bóng với V05 | Xung đột thứ tự | V01 phase A phụ thuộc V05 phase B | tách `CoachBubble` (V01) / `Mascot` (V05) |
| V02 | Card/shell lấy màu theo `data-category` | THIẾU bước | không có `data-category` trong `src/**` | thêm bước gắn thuộc tính + cảnh báo tương phản chữ trắng |
| V03 | “App phải chạy offline” | KHÔNG CÓ trong spec | spec không nói offline | ghi lại lý do là tránh request ngoài |
| V06 | Phím “lún” khi bấm đúng | KHÔNG KHẢ THI | `GameShell.tsx` `key={roundIndex-reviewCycle}` unmount target ngay | chuyển sang lớp phủ shell (V10) |
| V07 | Thay lưới card | THIẾU ràng buộc | `GameCard` dùng chung với Chơi tự do; App.test đếm 10 `game-card`, tìm nút disabled `/Gõ số/` | `PathStation` riêng, giữ `button disabled` + aria |
| V08 | Confetti ~1.5s | Cần ghi spec | spec dòng 281 chỉ nói feedback < 700ms | thêm UX rule mới trong V17 |
| V10 | Nổ sao quanh target, target lắc | KHÔNG KHẢ THI (như V06) | như V06 | lớp phủ `.stage-burst`, giữ shake ở stage |
| FACT bài tập | 9/10 game kho = số lượt, `% length`; Guided thấy 0–4; I, Z vắng | ĐÚNG | 9 file `src/games/*.tsx` dòng chọn mục; `App.tsx:67` `roundLimit` | thêm bảng kho/lượt |
| FACT bài tập | `useKeySequence` lọc nên không có Space/Enter | MỘT PHẦN | `useKeySequence.ts`: Space dài 1 ký tự nên được nhận khi mong đợi; chỉ Enter bị lọc | sửa FACT + V15 |
| V11 | Lượt ôn dùng lại đúng mục | ĐÚNG, tự có | GameShell giữ `roundIndex`, chỉ tăng `reviewCycle` | ghi rõ + seed mới khi `Chơi lại` |
| V12 | letters 26 chữ | XUNG ĐỘT test | `FindKeyGame.test.tsx:9-11` (T24) | chia 14 + 12 |
| V12 | Mọi game kho > số lượt | KHÔNG KHẢ THI cho numbers | chỉ có 10 chữ số, 10 lượt | miễn numbers |
| V13 | Prompt đọc theo mục tiêu | THIẾU | `registry.ts` intro “Hãy click vào ngôi sao.” | thêm sửa intro |
| V14 | Guided luôn mức dễ | KHẢ THI | GameShell biết `roundLimit` | ghi cơ chế |
| V15 | Thêm GameId cuối | KHẢ THI | `normalizeProgress` điền game thiếu; `PATH_ORDER = GAME_IDS` | thêm test Enter + focus |
| Phase D | Chờ owner | ĐÃ CHỐT 2026-09-30 | owner đồng ý làm D | chi tiết V15/V16, ID cố định, tổng sao tự tăng (`ProgressScreen.tsx:20` `gameRegistry.length * 3`) |
| Docs | `docs/index.md` ghi “dev bắt đầu từ” fix-audit | CŨ | fix-audit chỉ còn T44 mở | index chỉ sang plan này |
| Docs | Ghi chú dời T44/G16 | CHƯA CÓ | `fix-audit-sep30.md` T44, `v2-guided-play.md` G16 | đã thêm |

Ngoài phạm vi, không lên lịch: dự án chưa có `docs/biz/` (docs.A3) — TapGo hiện không có quyết định kinh doanh nào cần ghi; mở lại khi có định giá/phân phối.
