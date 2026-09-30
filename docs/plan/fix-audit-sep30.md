# TapGo — Fix plan từ audit toàn repo (sep30)

> Plan thực thi cho các finding trong [research/audit-full-sep30.md](../research/audit-full-sep30.md). Baseline: commit `fa28cb4`. Bản theo dõi trạng thái: Notion “TapGo — Review & Fix Plan (2026-09-30)” (https://app.notion.com/p/185c1dc1605441f98e2198f45726880e).

## Cách dùng plan này

- Làm theo **thứ tự phase** (0 → 6). Trong mỗi phase, làm P1 trước P2 trước P3.
- Mỗi task là **một commit riêng**, message dạng `fix: …` / `test: …` / `docs: …` / `refactor: …` và không kèm trailer model-credit.
- Trước khi commit, chạy `npx tsc --noEmit && npm test`. Riêng task có đụng build hoặc deps thì chạy thêm `npm run build`.
- Số dòng `file:line` tính theo commit `fa28cb4`. Code đã sửa thì số dòng có thể lệch; khi đó tìm theo đoạn code được trích trong phần Evidence.
- Task có ⚠️ **Cần owner chốt**: làm theo *Mặc định đề xuất*, trừ khi owner đã quyết định khác. Quyết định cuối cùng phải ghi lại vào `docs/feat/tapgo-mvp.md`.
- Làm xong task nào thì đánh `[x]` ở dòng tiêu đề của task đó, và cập nhật Status bên Notion.
- **Trạng thái ở dòng tiêu đề task:** `[ ]` chưa ai nhận · `[~]` đang làm (kèm `— đang làm: <người/lane>` cuối tiêu đề) · `[x]` xong. Nhận task bằng cách sửa đúng chuỗi `### [ ] Txx` thành `### [~] Txx`; nếu chuỗi `[ ]` không còn thì task đã có người nhận, chọn task khác. Không sửa task đang `[~]` của người khác.
- Khi nhận task: đổi Status bên Notion sang In progress. Khi xong: đổi tiêu đề sang `[x]` (bỏ phần `— đang làm`), Status Notion sang Done, và commit file plan cùng commit của task.

## Phụ thuộc giữa các task

- T08 → T31, T36 · T10 → T12 → T34 · T23 và T25 → T31 · T10, T12, T16, T17, T22 → T40 · T44 → chuyển `plan/tapgo-mvp.md` sang `plan/done/`.

## Quyết định cần owner chốt

- **T10 · Rê chuột luôn cho 3 sao và không bao giờ kích hoạt retry/assist**: mặc định đề xuất là Tính sai khi đi vào checkpoint sai thứ tự; rời khỏi đường không tính.
- **T16 · Guided: "Bài tiếp theo" nên đi tới bài được gợi ý, không phải bài kế theo thứ tự**: mặc định đề xuất là Guided dùng `getRecommendedGameId`; Path và Free Play giữ thứ tự.
- **T17 · Lượt ôn lại làm quick session vượt quá 5 lượt**: mặc định đề xuất là Bỏ lượt ôn trong quick session (roundLimit).
- **Session guided 5 lượt vẫn tính là hoàn thành và mở khoá Lộ trình**: mặc định đề xuất là giữ nguyên và ghi rõ vào spec (việc này làm trong T40).

## Tổng quan

| Mã | Task | Pri | Effort | Area |
| --- | --- | --- | --- | --- |
| T01 | Commit working tree guided play v1 thành 5 commit | P1 | M | Build/Release |
| T02 | Ghim version dependency thay cho "latest" | P2 | S | Build/Release |
| T03 | Tạo CHANGELOG.md với mục [Unreleased] | P2 | S | Build/Release |
| T04 | Lời nhắc "Thử lại" biến mất sau ~420ms (và ngay lập tức khi reduced-motion) | P1 | S | UI/UX |
| T05 | Nút Home, nghe lại, "Xem cách chơi", "Nghe yêu cầu" nhỏ hơn 72px | P1 | S | UI/UX |
| T06 | Prompt game không nổi bật nhất; Click và Rê chuột không có prompt | P1 | S | UI/UX |
| T07 | Kéo thả: bấm vào vật mà không kéo vẫn bị tính là thả sai | P1 | S | Flow/Logic |
| T08 | Kéo thả: thả lên ô sai gần ô đúng vẫn được tính là đúng (snap quá rộng) | P2 | S | Flow/Logic |
| T09 | Rê chuột: thêm điểm bắt đầu, 4–6 checkpoint, và đường vẽ khớp điểm | P1 | M | UI/UX |
| T10 | Rê chuột luôn cho 3 sao và không bao giờ kích hoạt retry/assist | P1 | M | Flow/Logic |
| T11 | Ghép cặp: đổi từ hình–chữ sang hình–hình (bóng/màu/nhóm) | P1 | M | UI/UX |
| T12 | Thống nhất cơ chế assist cho mọi game (data-assist) | P1 | M | UI/UX |
| T13 | loadProgress kiểu được-hết-hoặc-mất-hết: 1 game key lỗi là xoá toàn bộ tiến độ | P2 | S | Flow/Logic |
| T14 | AudioContext mới cho mỗi tone (có thể leak khi bị suspended) | P2 | S | Flow/Logic |
| T15 | Speech không cancel khi rời game | P2 | S | Flow/Logic |
| T16 | Guided: "Bài tiếp theo" nên đi tới bài được gợi ý, không phải bài kế theo thứ tự | P2 | S | Flow/Logic |
| T17 | Lượt ôn lại làm quick session vượt quá 5 lượt | P3 | S | Flow/Logic |
| T18 | Hint được đọc lại ở mọi lỗi từ lần thứ 2 trở đi | P3 | S | Flow/Logic |
| T19 | Drag bắt đầu cả với chuột phải hoặc pointer phụ; thiếu lostpointercapture | P3 | S | Flow/Logic |
| T20 | Phím Space bị tính là lỗi và kích hoạt nút đang được focus | P3 | S | Flow/Logic |
| T21 | saveProgress (side effect) chạy trong updater của setProgress | P3 | S | Flow/Logic |
| T22 | Xoá nhánh "game definition thiếu" không thể xảy ra | P3 | S | Flow/Logic |
| T23 | Chuẩn hoá copy lỗi "Thử lại nhé!" và sửa hint sai ngữ cảnh | P2 | S | UI/UX |
| T24 | Dữ liệu vòng chơi: Chuỗi dài 3–5 ký tự, FindKey khác bộ Letters | P2 | S | UI/UX |
| T25 | Mỗi game có nút "Nghe yêu cầu" đọc prompt của lượt; đổi tên nút ở header | P2 | M | UI/UX |
| T26 | Game Từ/Chuỗi đánh dấu ký tự đã gõ xong | P2 | S | UI/UX |
| T27 | GameCard và aria: nút ghi "Chơi", bài khoá nói cách mở, aria-label có role | P2 | S | UI/UX |
| T28 | Màn Tiến độ: thêm nút làm theo gợi ý, dùng StarRating | P2 | S | UI/UX |
| T29 | Desktop gate dưới 900px bị cuộn ngang | P2 | S | UI/UX |
| T30 | Click mục tiêu: xáo vị trí mỗi session (spec ghi "ngẫu nhiên an toàn") | P3 | S | UI/UX |
| T31 | Gom logic lặp: useKeySequence, ListenButton, resolveDrop, stage chung cho game phím | P2 | M | Flow/Logic |
| T32 | Design token là nguồn duy nhất (radius, font, motion) | P2 | M | UI/UX |
| T33 | Xoá code và CSS chết | P2 | S | UI/UX |
| T34 | Test assistLevel 0/1/2, đọc intro, đọc hint ở GameShell và game chuột | P1 | M | Tests |
| T35 | Test thao tác sai cho FindKey, NumberKey (MouseTrail theo T10) | P2 | S | Tests |
| T36 | Test kéo thả: nhánh snap/assist và pointer cancel | P2 | M | Tests |
| T37 | Test path fallback, localStorage throw, guided 1/5 vs Path 1/10 | P2 | S | Tests |
| T38 | app.test.ts: bỏ node:fs và @ts-expect-error, dùng ?raw | P2 | S | Tests |
| T39 | Vitest: giảm thời gian dựng jsdom (69% thời gian test) | P3 | S | Tests |
| T40 | Đồng bộ spec với code (Testing strategy, assist, ProgressScreen, Error handling) | P2 | S | Docs |
| T41 | Plan mới docs/plan/v2-guided-play.md; plan cũ giữ Step 6–8 | P2 | M | Docs |
| T42 | Research doc: đúng schema B2, tách doc kế nhiệm, thêm vào index | P2 | M | Docs |
| T43 | Stamp `updated` dùng commit hash hoặc semver | P3 | S | Docs |
| T44 | Manual QA trên Chrome/Edge desktop (Step 6 của plan cũ) | P1 | M | Docs |

## Phase 0 · Baseline

### [x] T01 · Commit working tree guided play v1 thành 5 commit

**P1 · Effort M · Build/Release** · Review: C-14  
Files: `git (35 M + 3 untracked)`

> Đã làm 2026-09-30: toàn bộ WIP được commit **gộp thành 1 commit** là `fa28cb4` (`feat: add guided play v1 with adaptive hints and visual system`), không chia thành 5 commit như đề xuất ban đầu. Lý do: chưa rà từng hunk để tách nhóm cho chắc, và gộp 1 commit không làm mất gì.

- **Vấn đề:** Toàn bộ guided play v1 (+1411/−170 dòng) chưa commit. Mọi fix sau sẽ lẫn diff, và mất việc nếu lỡ tay.
- **Where:** `git status` trên `master`, không có upstream. Untracked: `docs/research/`, `src/screens/ProgressScreen.test.tsx`, `src/styles/app.test.ts`.
- **Evidence:** FACT: 35 file M, riêng `app.css` +791 dòng. ASSUMPTION: chưa đọc từng hunk để chắc mỗi file chỉ thuộc 1 nhóm, tác giả cần xác nhận file nào đã xong.
- **Fix:** Chia 5 commit theo thứ tự:
  1. `feat: add guided play quick session`: types, registry, path(+test), progress(+test), App(+test), GameShell(+test), HomeScreen.
  2. `feat: add adaptive retry hints and assist levels`: hooks/useExpectedKey, hooks/usePointerDrag, `games/*.tsx` và test.
  3. `feat: add parent practice recommendation`: ProgressScreen + test.
  4. `style: apply child-friendly visual system`: app.css, theme.css, app.test.ts.
  5. `docs: …`: để sau khi làm Phase 6 (hoặc commit bản hiện tại trước).
  Sau mỗi commit chạy `npx tsc --noEmit && npm test`.
- **Done when:** `git status` sạch; checkout từng commit riêng thì tsc và test đều pass; message không có trailer model-credit.

### [x] T02 · Ghim version dependency thay cho "latest"

**P2 · Effort S · Build/Release** · Review: C-12  
Files: `package.json, package-lock.json`

- **Vấn đề:** Cả 12 dep đều để `"latest"`, nên `npm install` trên máy mới có thể kéo major mới và làm vỡ build.
- **Where:** `package.json:12-26`
- **Evidence:** FACT: lock hiện ghim react/react-dom 19.3.0, typescript 7.0.2, vite 8.3.0, vitest 5.0.0, jsdom 30.0.1, @vitejs/plugin-react 6.1.1.
- **Fix:** Đổi mỗi dep sang `^<version trong lock>` (typescript dùng `~7.0.2`), chạy `npm install` để đồng bộ lock, rồi chạy tsc, test và build.
- **Done when:** `grep -c '"latest"' package.json` ra 0; test và build vẫn xanh.

### [x] T03 · Tạo CHANGELOG.md với mục [Unreleased]

**P2 · Effort S · Build/Release** · Review: C-11  
Files: `CHANGELOG.md (mới)`

- **Vấn đề:** Repo chưa có CHANGELOG, trong khi release.A1 bắt buộc có ngay từ khi tạo project.
- **Where:** root `/app/tapgo`; `package.json:3` version 0.1.0; chưa có tag.
- **Evidence:** FACT: `ls CHANGELOG.md` báo No such file.
- **Fix:** Tạo `CHANGELOG.md` với `## [Unreleased]` liệt kê guided play v1, assist, visual system khớp với các commit của T01. Chưa bump version.
- **Done when:** File tồn tại và các mục khớp với commit của T01.

## Phase 1 · P1 gameplay/UX

### [x] T04 · Lời nhắc "Thử lại" biến mất sau ~420ms (và ngay lập tức khi reduced-motion)

**P1 · Effort S · UI/UX** · Review: A-1, B-1  
Files: `src/game/GameShell.tsx, src/styles/app.css`

- **Vấn đề:** Trẻ gần như không kịp đọc hoặc nhìn thấy hint sau khi làm sai.
- **Where:** `GameShell.tsx:163-165, :174`; `app.css:349-351, :812-820`
- **Evidence:** FACT: hint chỉ render khi `feedbackState === 'retry'`, và `onAnimationEnd={() => setFeedbackState(null)}` xoá state đó khi shake 420ms kết thúc. Với reduced-motion, `animation-duration: 0.01ms` nên hint mất ngay. `onAnimationEnd` không kiểm `event.target`, nên animation con bubble lên cũng xoá hint.
- **Fix:** Tách thành 2 state: `visibleHint` (chỉ xoá trong `handleRoundComplete` và `restart`) và `feedbackState` (chỉ để gắn class animation). `onAnimationEnd` chỉ xử lý khi `event.target === event.currentTarget`.
- **Done when:** Test GameShell: gọi `onRetry`, rồi `fireEvent.animationEnd(game-stage)`, thì `getByRole('status')` vẫn còn; sau khi hoàn thành lượt thì status mất.

### [x] T05 · Nút Home, nghe lại, "Xem cách chơi", "Nghe yêu cầu" nhỏ hơn 72px

**P1 · Effort S · UI/UX** · Review: B-2  
Files: `src/styles/app.css, src/styles/app.test.ts`

- **Vấn đề:** Vi phạm quy tắc target tối thiểu 72×72 trong spec, trẻ 6 tuổi khó bấm trúng.
- **Where:** `app.css:160-169` (64×64), `:287-296` (min-height 48px), `:423-432` (min-height 56px)
- **Evidence:** FACT: đã trích nguyên giá trị CSS. `app.test.ts` chưa kiểm các nút này.
- **Fix:** Đặt `.screen-header > button` 72×72, và `min-height: 72px` cho `.guide-toggle` và `.listen-button`. Thêm assertion vào `app.test.ts`.
- **Done when:** `app.test.ts` kiểm 72px cho 3 selector trên và pass.

### [ ] T06 · Prompt game không nổi bật nhất; Click và Rê chuột không có prompt

**P1 · Effort S · UI/UX** · Review: B-3  
Files: `src/styles/app.css, src/games/ClickTargetGame.tsx, src/games/MouseTrailGame.tsx`

- **Vấn đề:** Tên game ở header to hơn yêu cầu của lượt. Hai game chuột chỉ có intro 20px màu nhạt.
- **Where:** `app.css:154-158` (h1 clamp 34–48px), `:332-336` (.game-prompt clamp 28–42px), `:281-285`; `ClickTargetGame.tsx:23-40`; `MouseTrailGame.tsx:27-43`
- **Evidence:** FACT: đã so sánh font-size trong CSS.
- **Fix:** Giảm h1 trong `.game-heading` xuống khoảng 28px và tăng `.game-prompt` lên ≥44px. Thêm `<p className="game-prompt">` cho ClickTarget ("Click vào ngôi sao") và MouseTrail ("Đưa chuột qua các điểm tới 🏁"), đặt *ngoài* play-area để click vào prompt không bị tính là miss.
- **Done when:** Mọi game render `.game-prompt`, và font-size của prompt lớn hơn h1 của heading.

### [x] T07 · Kéo thả: bấm vào vật mà không kéo vẫn bị tính là thả sai

**P1 · Effort S · Flow/Logic** · Review: B-5  
Files: `src/hooks/usePointerDrag.ts`

- **Vấn đề:** Trẻ chạm nhẹ vào vật sẽ bị tăng attempt, rung màn và hiện hint, làm giảm sao dù chưa hề kéo.
- **Where:** `usePointerDrag.ts:49-53`; `DragSortGame.tsx:20-34`; `DragMatchGame.tsx:21-35`
- **Evidence:** FACT: `onPointerUp` luôn gọi `onDrop`. Toạ độ lúc thả nằm trên chính vật nên không trúng zone nào, và đi vào nhánh `attempts += 1; onRetry()`.
- **Fix:** Trong `onPointerUp`: nếu `Math.hypot(dx, dy) < 10` thì chỉ `reset()`, không gọi `onDrop`.
- **Done when:** Test: pointerDown rồi pointerUp tại cùng toạ độ thì `onRetry` không được gọi; sau đó thả đúng thì outcome có `attempts: 1`.

### [x] T08 · Kéo thả: thả lên ô sai gần ô đúng vẫn được tính là đúng (snap quá rộng)

**P2 · Effort S · Flow/Logic** · Review: B-8, C (out-of-lane)  
Files: `src/games/DragSortGame.tsx, src/games/DragMatchGame.tsx, src/hooks/usePointerDrag.ts`

- **Vấn đề:** Snap padding (24 + assist×16 px) lớn hơn khoảng cách giữa các ô (16px ở DragMatch), nên chấm sai.
- **Where:** `DragSortGame.tsx:25-28`; `DragMatchGame.tsx:26-29`; `app.css:567` (gap 26px), `:612` (gap 16px)
- **Evidence:** FACT: điều kiện là `zone correct || isPointNearElement(correctZone, …)`, không loại trừ trường hợp `zone` là ô sai.
- **Fix:** Nếu `zone` tồn tại và là ô sai thì trả sai; chỉ dùng snap khi `zone === null`. Gom thành helper `resolveDrop()` trong `usePointerDrag.ts`, dùng cho cả 2 game.
- **Done when:** Test: thả trong ô sai, cách mép ô đúng khoảng 10px, thì `onRetry` được gọi.

### [x] T09 · Rê chuột: thêm điểm bắt đầu, 4–6 checkpoint, và đường vẽ khớp điểm

**P1 · Effort M · UI/UX** · Review: B-4  
Files: `src/games/MouseTrailGame.tsx, src/styles/app.css`

- **Vấn đề:** Mỗi đường chỉ có 5 điểm và không có điểm bắt đầu. Đường kẻ hướng dẫn là một thanh ngang cố định, không đi qua các điểm.
- **Where:** `MouseTrailGame.tsx:4-11, :29, :39`; `app.css:513-519`
- **Evidence:** FACT: `.trail-guide` dùng `inset: 48% 8%` trong khi các điểm nằm ở top 22–70%. ASSUMPTION: spec "điểm bắt đầu qua 4-6 checkpoint tới đích" tức tổng cộng 6–8 điểm.
- **Fix:** Mỗi trail gồm 🟢 start, 4–6 điểm giữa, 🏁 đích. Thay `.trail-guide` bằng `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline>` vẽ từ chính dữ liệu `trail`.
- **Done when:** Unit test kiểm `TRAILS[i].length` trong [6,8]; kiểm bằng mắt đường đi qua tâm các checkpoint.

### [x] T10 · Rê chuột luôn cho 3 sao và không bao giờ kích hoạt retry/assist

**P1 · Effort M · Flow/Logic** · Review: A/B/C (out-of-lane), B-7  
Files: `src/games/MouseTrailGame.tsx`

> ⚠️ **Cần owner chốt.** Mặc định đề xuất: Tính sai khi đi vào checkpoint sai thứ tự; rời khỏi đường không tính.

- **Vấn đề:** `attempts` luôn bằng `correct`, và game không gọi `onRetry`, nên sao, ôn lại và assist của game này đều không có tác dụng.
- **Where:** `MouseTrailGame.tsx:13, :21, :34`
- **Evidence:** FACT: `onRoundComplete({ correct: trail.length, attempts: trail.length })`; component không nhận `onRetry`.
- **Fix:** Định nghĩa thao tác sai: đi vào checkpoint *không phải* checkpoint kế tiếp thì `attempts += 1` và gọi `onRetry(hint)`, không reset tiến độ (khớp spec "ra ngoài không reset"). Report `attempts` thật.
- **Done when:** Test: đi vào checkpoint 2 trước checkpoint 1 thì `onRetry` được gọi; outcome `{correct: n, attempts: n+1}`.

### [x] T11 · Ghép cặp: đổi từ hình–chữ sang hình–hình (bóng/màu/nhóm)

**P1 · Effort M · UI/UX** · Review: B-6  
Files: `src/games/DragMatchGame.tsx, src/styles/app.css`

- **Vấn đề:** Đích hiện là chữ ('Bóng' / 'Gấu bông' / 'Bong bóng'), bắt trẻ 6 tuổi phải đọc, lệch spec ("xe -> bóng xe hoặc vật -> màu/nhóm", "ít chữ").
- **Where:** `DragMatchGame.tsx:5-14, :41, :68`
- **Evidence:** FACT: dữ liệu các vòng đều dùng label chữ.
- **Fix:** Đích là bóng đen của chính emoji (class `.match-shadow` với `filter: brightness(0)`) hoặc ô màu/nhóm. Chữ chỉ giữ trong `aria-label`.
- **Done when:** Ô đích không còn chữ hiển thị; test DragMatch pass với selector `data-match-label`.

### [ ] T12 · Thống nhất cơ chế assist cho mọi game (data-assist)

**P1 · Effort M · UI/UX** · Review: B-7, C-7  
Files: `src/games/*.tsx, src/styles/app.css`

- **Vấn đề:** Có hai cơ chế song song (`.assist-level-N` và `is-assisted`). Game Từ/Chuỗi không có assist, PickPicture level 1 không có tác dụng, 5 game phím không nhận `assistLevel`.
- **Where:** `WordTypingGame.tsx:36-41`; `SequenceTypingGame.tsx:36-41`; `PickPictureGame.tsx:43`; `app.css:353-369, :497-501, :558-561`
- **Evidence:** FACT: grep `assistLevel` chỉ trúng ở các game chuột và PickPicture.
- **Fix:** Mỗi game gắn `data-assist={assistLevel}` lên target thật; CSS chỉ dùng `[data-assist="1"]` và `[data-assist="2"]`. Thêm assist cho ký tự active ở Từ/Chuỗi và Letter/Number/FindKey (level 1 viền đậm, level 2 phóng to), thêm level 1 cho PickPicture. Làm sau T10.
- **Done when:** `grep "assist-level-" src/styles/app.css` ra 0; mỗi game có test `assistLevel=2` thấy `data-assist="2"`.

## Phase 2 · Logic & flow

### [x] T13 · loadProgress kiểu được-hết-hoặc-mất-hết: 1 game key lỗi là xoá toàn bộ tiến độ

**P2 · Effort S · Flow/Logic** · Review: A-2  
Files: `src/game/progress.ts, src/game/progress.test.ts`

- **Vấn đề:** Thêm hoặc đổi tên một game trong tương lai sẽ reset tiến độ của mọi bé, và không khôi phục được.
- **Where:** `progress.ts:50-63, :71`
- **Evidence:** FACT: `GAME_IDS.every(...)` phải pass hết, không thì `createDefaultProgress()` chạy và lần save kế tiếp ghi đè dữ liệu cũ. Reach hiện tại là 0 (ASSUMPTION) nhưng mất mát không đảo ngược được.
- **Fix:** Thay `isProgressState` bằng `normalizeProgress(raw)`: chỉ reject khi không phải object hoặc `version !== 1`. Với mỗi GAME_ID, giữ entry nếu hợp lệ, không thì dùng entry rỗng. `lastGameId` sai thì thành `null`.
- **Done when:** Test: dữ liệu có 9 game hợp lệ và 1 game hỏng thì vẫn giữ được 9 game; test JSON hỏng cũ vẫn pass.

### [x] T14 · AudioContext mới cho mỗi tone (có thể leak khi bị suspended)

**P2 · Effort S · Flow/Logic** · Review: A-3  
Files: `src/hooks/useFeedbackTone.ts`

- **Vấn đề:** Mỗi câu trả lời đúng tạo 2 AudioContext. Nếu context bị suspended thì `ended` không bao giờ fire, nên context không được đóng.
- **Where:** `useFeedbackTone.ts:8, :21-23, :31-32`
- **Evidence:** FACT: `new AudioContextClass()` trong `playTone`. ASSUMPTION: bị suspended khi không có user activation (ví dụ vòng Rê chuột xong bằng pointermove).
- **Fix:** Tạo một context cấp module (lazy), gọi `resume()` nếu đang suspended, không close sau mỗi tone, giữ try/catch no-op.
- **Done when:** Test mock AudioContext: sau 3× `correct()` + 2× `retry()`, constructor chỉ được gọi 1 lần.

### [x] T15 · Speech không cancel khi rời game

**P2 · Effort S · Flow/Logic** · Review: A-4  
Files: `src/hooks/useSpeech.ts, src/hooks/useSpeech.test.ts`

- **Vấn đề:** Bấm 🏠 xong, câu intro vẫn tiếp tục đọc.
- **Where:** `useSpeech.ts:4-10, :19-30`; `GameShell.tsx:42-44, :124`
- **Evidence:** FACT: không có cleanup khi unmount; kiểm tra support bị lặp 2 chỗ.
- **Fix:** Thêm `useEffect(() => () => window.speechSynthesis?.cancel(), [])`, và gom `isSpeechSupported()` thành một helper.
- **Done when:** Test: unmount hook thì `speechSynthesis.cancel` được gọi.

### [x] T16 · Guided: "Bài tiếp theo" nên đi tới bài được gợi ý, không phải bài kế theo thứ tự

**P2 · Effort S · Flow/Logic** · Review: B (out-of-lane), lead verified  
Files: `src/App.tsx, src/App.test.tsx`

> ⚠️ **Cần owner chốt.** Mặc định đề xuất: Guided dùng `getRecommendedGameId`; Path và Free Play giữ thứ tự.

- **Vấn đề:** Ở Guided Play, "Bài tiếp theo" có thể đưa bé vào lại bài đã hoàn thành, không nhất quán với logic chọn bài của "Chơi ngay".
- **Where:** `App.tsx:43-50, :69`
- **Evidence:** FACT (lead đã đọc): `openNext` luôn dùng `getNextGameId(gameId)` cho mọi mode.
- **Fix:** Khi `mode === 'guided'`, tính bài kế tiếp bằng `getRecommendedGameId(progressSauKhiGhi)`, loại trừ bài vừa chơi nếu nó đã đạt 3 sao. `nextLabel` tính theo cùng logic.
- **Done when:** Test App: đã xong letters và numbers, Chơi ngay rồi xong bài words thì "Bài tiếp theo" mở find-key (bài đầu tiên chưa xong).

### [x] T17 · Lượt ôn lại làm quick session vượt quá 5 lượt

**P3 · Effort S · Flow/Logic** · Review: A-10, B (out-of-lane)  
Files: `src/game/GameShell.tsx, docs/feat/tapgo-mvp.md`

> ⚠️ **Cần owner chốt.** Mặc định đề xuất: Bỏ lượt ôn trong quick session (roundLimit).

- **Vấn đề:** Mỗi lượt có `attempts > correct` sinh thêm một lượt ôn, nên guided có thể kéo dài tới 10 lượt, trái với spec "tối đa 5 lượt".
- **Where:** `GameShell.tsx:39, :57-61`
- **Evidence:** FACT: review được chèn thêm bất kể có `roundLimit` hay không.
- **Fix:** Không sinh lượt ôn khi có `roundLimit`, hoặc ghi vào spec rằng lượt ôn không tính vào giới hạn 5. Thêm test tương ứng.
- **Done when:** Spec ghi rõ và có test: guided với 5 lượt đều sai 1 lần vẫn kết thúc sau đúng 5 lượt.

### [x] T18 · Hint được đọc lại ở mọi lỗi từ lần thứ 2 trở đi

**P3 · Effort S · Flow/Logic** · Review: A-8  
Files: `src/game/GameShell.tsx`

- **Vấn đề:** Bé bấm lung tung thì app đọc liên tục và guide tự mở lại dù bé đã đóng.
- **Where:** `GameShell.tsx:85-88`
- **Evidence:** FACT: điều kiện là `if (nextRetryCount >= 2) { setGuideOpen(true); speak(safeHint); }`.
- **Fix:** Đổi thành `=== 2`.
- **Done when:** Test: 4× `onRetry` thì `speak(hint)` được gọi 1 lần và guide mở 1 lần.

### [x] T19 · Drag bắt đầu cả với chuột phải hoặc pointer phụ; thiếu lostpointercapture

**P3 · Effort S · Flow/Logic** · Review: A-9, B-20  
Files: `src/hooks/usePointerDrag.ts`

- **Vấn đề:** Chuột phải mở context menu, có thể không có pointerup, và vật bị kẹt ở trạng thái đang kéo.
- **Where:** `usePointerDrag.ts:34-39, :55-57`
- **Evidence:** FACT: không kiểm `button` hay `isPrimary`.
- **Fix:** Thêm `if (event.button !== 0 || !event.isPrimary) return;` và trả thêm `onLostPointerCapture: reset`.
- **Done when:** Test: pointerDown với `button: 2` thì `isDragging` vẫn false.

### [x] T20 · Phím Space bị tính là lỗi và kích hoạt nút đang được focus

**P3 · Effort S · Flow/Logic** · Review: B-19  
Files: `src/hooks/useExpectedKey.ts, src/games/WordTypingGame.tsx, src/games/SequenceTypingGame.tsx`

- **Vấn đề:** Sau khi bấm 🔊 hoặc "Xem cách chơi", nhấn Space vừa tính lỗi vừa bấm lại nút đó.
- **Where:** `useExpectedKey.ts:13`; `WordTypingGame.tsx:13`; `SequenceTypingGame.tsx:13`
- **Evidence:** FACT: `' '.length === 1` nên lọt qua guard.
- **Fix:** Bỏ qua `' '` khi target không phải Space, và `preventDefault` cho phím ký tự trong game gõ.
- **Done when:** Test: nhấn Space thì `onRetry` không được gọi.

### [x] T21 · saveProgress (side effect) chạy trong updater của setProgress

**P3 · Effort S · Flow/Logic** · Review: A-6  
Files: `src/App.tsx`

- **Vấn đề:** Updater không thuần: StrictMode trong dev chạy 2 lần nên ghi localStorage 2 lần.
- **Where:** `App.tsx:36-40`; `main.tsx:14`
- **Evidence:** FACT: `setProgress((current) => { …; saveProgress(next); return next; })`.
- **Fix:** Giữ updater thuần, thêm `useEffect(() => saveProgress(progress), [progress])`, bỏ qua lần mount đầu nếu cần.
- **Done when:** Test với StrictMode và spy: mỗi lần hoàn thành chỉ save 1 lần.

### [x] T22 · Xoá nhánh "game definition thiếu" không thể xảy ra

**P3 · Effort S · Flow/Logic** · Review: A-7, C-7  
Files: `src/App.tsx, src/game/registry.ts, docs/feat/tapgo-mvp.md`

- **Vấn đề:** `Record<GameId, …>` bảo đảm luôn có definition, nên nhánh fallback là code chết và còn lệch spec.
- **Where:** `App.tsx:60-76`; `registry.ts:13, :32-34`; spec Error handling
- **Evidence:** FACT: kiểu dữ liệu đã loại trừ `undefined`.
- **Fix:** Cho `getGameDefinition(): GameDefinition` trả thẳng từ map, xoá nhánh fallback trong App, sửa dòng Error handling trong spec thành "không thể xảy ra (Record<GameId>)".
- **Done when:** tsc pass; App không còn nhánh `definition ?`.

## Phase 3 · UX & nội dung

### [x] T23 · Chuẩn hoá copy lỗi "Thử lại nhé!" và sửa hint sai ngữ cảnh

**P2 · Effort S · UI/UX** · Review: B-9  
Files: `src/game/GameShell.tsx, src/hooks/useExpectedKey.ts, src/games/WordTypingGame.tsx, src/games/SequenceTypingGame.tsx`

- **Vấn đề:** Chuỗi 'Thử lại nhé, con làm chậm thôi.' bị hardcode 3 lần. Game Từ bảo "tìm chữ trên màn hình" trong khi phải tìm trên bàn phím. Game Chuỗi không truyền hint.
- **Where:** `GameShell.tsx:30, :78, :96`; `useExpectedKey.ts:19`; `WordTypingGame.tsx:17`; `SequenceTypingGame.tsx:17`
- **Evidence:** FACT: đã grep.
- **Fix:** Tạo một hằng `RETRY_PREFIX = 'Thử lại nhé!'`, hint dạng `${RETRY_PREFIX} Tìm phím X trên bàn phím nhé.`, game Chuỗi truyền hint theo ký tự hiện tại.
- **Done when:** `grep "con làm chậm thôi"` còn ≤1 hit; mọi hint bắt đầu bằng "Thử lại nhé!"; test Word/Sequence kiểm hint.

### [x] T24 · Dữ liệu vòng chơi: Chuỗi dài 3–5 ký tự, FindKey khác bộ Letters

**P2 · Effort S · UI/UX** · Review: B-10  
Files: `src/games/SequenceTypingGame.tsx, src/games/FindKeyGame.tsx`

- **Vấn đề:** Mọi chuỗi đều 3 ký tự (spec là 3–5), 3 chuỗi trùng WORDS, và FindKey dùng y hệt bộ chữ của game 1.
- **Where:** `SequenceTypingGame.tsx:4`; `FindKeyGame.tsx:4` so với `LetterKeyGame.tsx:4`
- **Evidence:** FACT: đã so sánh các mảng.
- **Fix:** Chuỗi ví dụ `ASD, ASDF, JKL, JKLM, FGH, ASDFG, QWE, RTYU`; FindKey dùng các chữ mới như `Q G H K R U V Y D O`.
- **Done when:** Unit test: độ dài trong [3,5], không giao với WORDS, và FindKey ≠ LETTERS.

### [ ] T25 · Mỗi game có nút "Nghe yêu cầu" đọc prompt của lượt; đổi tên nút ở header

**P2 · Effort M · UI/UX** · Review: B-16  
Files: `src/games/*.tsx, src/game/GameShell.tsx, src/components/ListenButton.tsx (mới)`

- **Vấn đề:** Các game Letters, Numbers, Words, Sequence, Click, Trail không nghe lại được mục tiêu của lượt. Một số game có 2 nút nghe gây rối.
- **Where:** `GameShell.tsx:129-135`; `FindKeyGame.tsx:15`; `PickPictureGame.tsx:34`; `DragSortGame.tsx:41`; `DragMatchGame.tsx:42`
- **Evidence:** FACT: nút ở header luôn đọc `definition.intro`.
- **Fix:** Tạo `components/ListenButton.tsx` nhận prop `text`, dùng trong mọi game. Đổi aria-label nút header thành "Nghe lại cách chơi".
- **Done when:** Test mỗi game: bấm "Nghe yêu cầu" thì `speak` được gọi với text chứa mục tiêu của lượt.

### [x] T26 · Game Từ/Chuỗi đánh dấu ký tự đã gõ xong

**P2 · Effort S · UI/UX** · Review: B-17  
Files: `src/games/WordTypingGame.tsx, src/games/SequenceTypingGame.tsx, src/styles/app.css`

- **Vấn đề:** Chỉ có trạng thái active và chưa, bé không thấy mình đã gõ được tới đâu.
- **Where:** `WordTypingGame.tsx:38`; `SequenceTypingGame.tsx:38`; `app.css:417-421`
- **Evidence:** FACT: chỉ có `data-active` true/false.
- **Fix:** Dùng `data-state="done|active|todo"`; trạng thái done dùng `--color-success` và `--color-success-soft`.
- **Done when:** Test: gõ đúng ký tự đầu thì span đầu có `data-state="done"`.

### [x] T27 · GameCard và aria: nút ghi "Chơi", bài khoá nói cách mở, aria-label có role

**P2 · Effort S · UI/UX** · Review: B-14  
Files: `src/components/GameCard.tsx, src/components/StarRating.tsx, src/games/LetterKeyGame.tsx, NumberKeyGame.tsx, WordTypingGame.tsx, MouseTrailGame.tsx`

- **Vấn đề:** Nút lặp lại tên bài, bài bị khoá không nói cách mở, và aria-label đặt trên div/span không có role nên bị bỏ qua.
- **Where:** `GameCard.tsx:16, :18-20`; `StarRating.tsx:7`; `LetterKeyGame.tsx:13`; `NumberKeyGame.tsx:13`; `WordTypingGame.tsx:36`; `MouseTrailGame.tsx:37`
- **Evidence:** FACT: đã đọc code.
- **Fix:** Nút ghi "Chơi" kèm `aria-label={`Chơi ${title}`}`; khi khoá ghi "🔒 Xong bài trước để mở"; thêm `role="img"` cho StarRating và các span có aria-label.
- **Done when:** `getByRole('button', {name: 'Chơi Gõ chữ cái'})` và `getByRole('img', {name: '2 sao'})` đều tìm được.

### [x] T28 · Màn Tiến độ: thêm nút làm theo gợi ý, dùng StarRating

**P2 · Effort S · UI/UX** · Review: B-15  
Files: `src/screens/ProgressScreen.tsx, src/App.tsx`

- **Vấn đề:** Màn này đưa gợi ý nhưng không có hành động đi kèm, còn dùng dấu "—" và ghi sao bằng chữ.
- **Where:** `ProgressScreen.tsx:29-35, :33, :46`
- **Evidence:** FACT: chỉ có nút Home.
- **Fix:** Thêm `ActionButton` "Chơi {title}" gọi `onPlay(recommended.id)` (App truyền prop này), bỏ "—", dùng `StarRating`.
- **Done when:** `ProgressScreen.test.tsx`: bấm nút gợi ý thì `onPlay` được gọi đúng id.

### [x] T29 · Desktop gate dưới 900px bị cuộn ngang

**P2 · Effort S · UI/UX** · Review: B-13  
Files: `src/styles/app.css`

- **Vấn đề:** `body { min-width: 900px }` nên màn gate nằm trong body rộng hơn viewport.
- **Where:** `app.css:18, :56`
- **Evidence:** FACT: đã đọc CSS. ASSUMPTION: thanh cuộn thật sự hiện ra thì cần kiểm khi chạy.
- **Fix:** Bỏ `min-width` khỏi body; nếu cần thì chỉ đặt cho `.home-screen`, `.screen-shell`, `.game-shell`.
- **Done when:** Ở viewport 600px, `scrollWidth === innerWidth`.

### [x] T30 · Click mục tiêu: xáo vị trí mỗi session (spec ghi "ngẫu nhiên an toàn")

**P3 · Effort S · UI/UX** · Review: B-21  
Files: `src/games/ClickTargetGame.tsx`

- **Vấn đề:** Lần nào chơi cũng cùng thứ tự vị trí.
- **Where:** `ClickTargetGame.tsx:4-7`
- **Evidence:** FACT: `POSITIONS` là mảng hằng.
- **Fix:** Xáo `POSITIONS` một lần mỗi session (trong `useState` initializer), vẫn giữ vùng an toàn 14–80% / 18–72%.
- **Done when:** Test mock `Math.random`: 2 lần mount cho thứ tự khác nhau.

## Phase 4 · Refactor & dọn dẹp

### [ ] T31 · Gom logic lặp: useKeySequence, ListenButton, resolveDrop, stage chung cho game phím

**P2 · Effort M · Flow/Logic** · Review: B-11  
Files: `src/hooks/*, src/games/*, src/components/ListenButton.tsx`

- **Vấn đề:** Guard phím lặp 3 lần; Letter/Number/FindKey gần như giống hệt nhau; nút nghe lặp 4 lần; `handleDrop` lặp 2 lần.
- **Where:** `useExpectedKey.ts:13`, `WordTypingGame.tsx:13`, `SequenceTypingGame.tsx:13`; `FindKeyGame.tsx:15-17`, `PickPictureGame.tsx:34-36`, `DragSortGame.tsx:20-43`, `DragMatchGame.tsx:21-44`
- **Evidence:** FACT: đã so từng dòng, đủ ngưỡng 3 lần.
- **Fix:** Viết `useKeySequence(target, onComplete, onRetry, hintFor)` (useExpectedKey là trường hợp dài 1); dùng `ListenButton` (T25) và `resolveDrop` (T08); cho 3 game phím dùng chung một stage. Làm sau T08, T12, T23, T25.
- **Done when:** `grep "event.repeat" src` còn 1 hit; `grep "Nghe yêu cầu" src/games` còn 0 hit; vitest pass.

### [ ] T32 · Design token là nguồn duy nhất (radius, font, motion)

**P2 · Effort M · UI/UX** · Review: B-12  
Files: `src/styles/theme.css, src/styles/app.css, index.html`

- **Vấn đề:** Có 52 dòng hardcode radius/font/ms; `--motion-feedback` không được dùng; chưa có token spacing.
- **Where:** `theme.css:14-18`; `app.css:165, 217, 235, 304, 391, 411, 447, 580, 596, 661, 737, 346, 350`; `index.html:6`
- **Evidence:** FACT: đã grep.
- **Fix:** Thêm `--radius-sm` (20px), `--radius-lg` (32px), `--motion-pop`, `--motion-shake`, `--font-prompt`, `--font-target`, `--font-title`, token spacing; thay toàn bộ chỗ dùng; `theme-color` trong `index.html` trùng `--color-bg`.
- **Done when:** `grep -E "border-radius: [0-9]+px" src/styles/app.css` ra 0; keyframes dùng `var(--motion-*)`.

### [ ] T33 · Xoá code và CSS chết

**P2 · Effort S · UI/UX** · Review: B-18  
Files: `src/games/PlaceholderGame.tsx, src/styles/app.css`

- **Vấn đề:** `PlaceholderGame.tsx` không được import ở đâu; `.result-secondary-action` và một số class không có tác dụng.
- **Where:** `PlaceholderGame.tsx`; `app.css:442-445, :677-679`; class `find-key-game`, `progress-screen`, `placeholder-game`
- **Evidence:** FACT: grep chỉ ra chỗ định nghĩa.
- **Fix:** Xoá file và các rule/class thừa.
- **Done when:** `grep -r "PlaceholderGame\|result-secondary-action" src` ra 0; vitest pass.

## Phase 5 · Test

### [ ] T34 · Test assistLevel 0/1/2, đọc intro, đọc hint ở GameShell và game chuột

**P1 · Effort M · Tests** · Review: C-1  
Files: `src/game/GameShell.test.tsx, src/games/*.test.tsx`

- **Vấn đề:** Cơ chế trợ giúp là tính năng chính của guided v1 nhưng gần như chưa có test.
- **Where:** `GameShell.tsx:40, :42-44, :85-88`; `GameShell.test.tsx:125-142`
- **Evidence:** FACT: grep `assistLevel` trong *.test.tsx chỉ trúng ở GameShell.test, và chỉ kiểm level 1.
- **Fix:** (a) Retry 3 lần thì có level 2. (b) `vi.mock('../hooks/useSpeech')`, assert đọc intro khi mount và đọc hint ở lỗi thứ 2. (c) Mỗi game chuột có case `assistLevel={2}`. Làm cùng hoặc sau T12.
- **Done when:** Suite pass; đổi ngưỡng ở `GameShell.tsx:40` thì test fail.

### [ ] T35 · Test thao tác sai cho FindKey, NumberKey (MouseTrail theo T10)

**P2 · Effort S · Tests** · Review: C-2  
Files: `src/games/FindKeyGame.test.tsx, NumberKeyGame.test.tsx, MouseTrailGame.test.tsx`

- **Vấn đề:** Spec yêu cầu mỗi game có test "thao tác sai không nhảy round" và outcome đúng.
- **Where:** `FindKeyGame.test.tsx:7-20`; `NumberKeyGame.test.tsx:12-15`; `MouseTrailGame.test.tsx:6-18`
- **Evidence:** FACT: FindKey chỉ test phím đúng; NumberKey không assert `onRetry`.
- **Fix:** Thêm case phím sai: `onRoundComplete` chưa được gọi, `onRetry` được gọi kèm hint, outcome `{1,2}`.
- **Done when:** 3 file có case sai; bỏ nhánh `onRetry` trong useExpectedKey thì test fail.

### [ ] T36 · Test kéo thả: nhánh snap/assist và pointer cancel

**P2 · Effort M · Tests** · Review: C-3  
Files: `src/games/DragSortGame.test.tsx, DragMatchGame.test.tsx`

- **Vấn đề:** jsdom trả rect toàn 0, nên nhánh `isPointNearElement` không bao giờ chạy trong test; chưa có test pointerCancel.
- **Where:** `DragSortGame.tsx:22-28`; `DragSortGame.test.tsx:25, :37`; `DragMatchGame.test.tsx:22, :28`
- **Evidence:** FACT: grep không thấy `pointerCancel` trong test.
- **Fix:** `vi.spyOn(HTMLElement.prototype,'getBoundingClientRect')` để tạo rect thật; test thả ngoài rect nhưng trong 24px, 40px với assist 0 và 1; `fireEvent.pointerCancel` thì vật về `translate(0px, 0px)`. Làm sau T08.
- **Done when:** Mỗi game thêm 2 test pass; đổi `24 + assistLevel*16` thì test fail.

### [ ] T37 · Test path fallback, localStorage throw, guided 1/5 vs Path 1/10

**P2 · Effort S · Tests** · Review: A-5, C-4, C-5  
Files: `src/game/path.test.ts, src/game/progress.test.ts, src/App.test.tsx`

- **Vấn đề:** Các nhánh quan trọng của spec chưa có test.
- **Where:** `path.ts:12-18`; `progress.ts:66-91`; `App.tsx:65`
- **Evidence:** FACT: path.test chỉ có case "first unfinished"; progress.test không có case throw.
- **Fix:** path: xong hết thì ra bài đầu tiên chưa 3 sao; xong hết 3 sao thì ra `letters`. progress: `getItem`/`setItem` throw không làm crash. App: Chơi ngay hiện `1 / 5`, Path hiện `1 / 10`.
- **Done when:** `npx vitest run` pass với các case mới.

### [x] T38 · app.test.ts: bỏ node:fs và @ts-expect-error, dùng ?raw

**P2 · Effort S · Tests** · Review: C-13  
Files: `src/styles/app.test.ts`

- **Vấn đề:** Nếu `@types/node` lọt vào qua dependency bắc cầu, `@ts-expect-error` thành lỗi và build fail. Regex CSS dễ vỡ.
- **Where:** `app.test.ts:1-5, :9-34`
- **Evidence:** FACT: có comment `@ts-expect-error Vitest runs in Node…`.
- **Fix:** `import css from './app.css?raw'`; chỉ giữ regex cho các bất biến quan trọng (72px, reduced-motion, focus-visible).
- **Done when:** `grep ts-expect-error src` ra 0; tsc, test, build xanh.

### [~] T39 · Vitest: giảm thời gian dựng jsdom (69% thời gian test) — đang làm: lead

**P3 · Effort S · Tests** · Review: C-15  
Files: `vite.config.ts`

- **Vấn đề:** jsdom được dựng 19 lần, mất 13.64s.
- **Where:** `vite.config.ts:6-9`
- **Evidence:** FACT: output của vitest.
- **Fix:** Thử `pool: 'vmThreads'`; chỉ giữ nếu vẫn 49/49 pass.
- **Done when:** Test pass và thời gian environment giảm rõ.

## Phase 6 · Docs & QA

### [ ] T40 · Đồng bộ spec với code (Testing strategy, assist, ProgressScreen, Error handling)

**P2 · Effort S · Docs** · Review: C-6, C-7  
Files: `docs/feat/tapgo-mvp.md`

- **Vấn đề:** Spec thiếu các hành vi đã ship (Xem cách chơi, lượt ôn, gợi ý phụ huynh), và dòng 264 / 289 lệch với code.
- **Where:** `docs/feat/tapgo-mvp.md:264, :289, :291-315`
- **Evidence:** FACT: drift loại Incomplete, đã grep đối chiếu với code.
- **Fix:** Cập nhật theo kết quả T10, T12, T16, T17, T22; mỗi dòng mới trong Testing strategy trỏ tới một test có thật.
- **Done when:** Đọc spec rồi grep code thì mỗi mục khớp nhau.

### [ ] T41 · Plan mới docs/plan/v2-guided-play.md; plan cũ giữ Step 6–8

**P2 · Effort M · Docs** · Review: C-8  
Files: `docs/plan/, docs/index.md`

- **Vấn đề:** Plan cũ không có task guided nào và ghi "39 tests" (thực tế 49).
- **Where:** `docs/plan/tapgo-mvp.md:111, :1115-1141`
- **Evidence:** FACT: grep `guided|assistLevel|onRetry` trong plan cũ ra 0.
- **Fix:** Tạo `docs/plan/v2-guided-play.md` chứa các task guided đã làm và các task trong database này; link vào `docs/index.md`. Chuyển plan cũ sang `docs/plan/done/` sau khi T44 xong.
- **Done when:** Plan mới được link trong index; không còn việc guided nằm ngoài plan.

### [ ] T42 · Research doc: đúng schema B2, tách doc kế nhiệm, thêm vào index

**P2 · Effort M · Docs** · Review: C-9  
Files: `docs/research/tapgo-learning-improvements.md, docs/index.md`

- **Vấn đề:** Doc chưa có trong index, thiếu các trường B2, và phần Amendment đổi Decision lẽ ra phải là doc kế nhiệm.
- **Where:** `docs/index.md:1-9`; `docs/research/tapgo-learning-improvements.md:1-83, :69-83`
- **Evidence:** FACT: đã đọc cả 2 file.
- **Fix:** Viết lại theo B2 (Start time / Initial purpose / Strategy / Checklist / Result+Verification / Decision); tách phần Guided thành `…-2.md`, doc gốc ghi `Status: superseded by …`; thêm cả hai vào index.
- **Done when:** Mọi file trong docs/ đều có trong index; research có đủ 6 trường.

### [ ] T43 · Stamp `updated` dùng commit hash hoặc semver

**P3 · Effort S · Docs** · Review: C-10  
Files: `docs/feat/tapgo-mvp.md, docs/research/*`

- **Vấn đề:** `> updated 2026-09-22 · guided play v1` không phải version hợp lệ theo docs.A4.
- **Where:** `docs/feat/tapgo-mvp.md:3`; `docs/research/tapgo-learning-improvements.md:3`
- **Evidence:** FACT: đã đọc stamp.
- **Fix:** Sau khi commit: `> updated <YYYY-MM-DD> · <short-hash>`; xoá stamp ở research.
- **Done when:** grep `updated` trong docs/feat chỉ ra dạng ngày kèm hash hoặc semver.

### [ ] T44 · Manual QA trên Chrome/Edge desktop (Step 6 của plan cũ)

**P1 · Effort M · Docs** · Review: Plan Step 6  
Files: `—`

- **Vấn đề:** Chưa ai chạy acceptance thủ công: log 2026-09-14 ghi môi trường không có trình duyệt.
- **Where:** `docs/plan/tapgo-mvp.md:1115-1141`
- **Evidence:** FACT: Step 6, 7, 8 vẫn `[ ]`.
- **Fix:** `npm run dev` rồi chạy checklist Step 6, cộng thêm: Chơi ngay 1/5, hint thử lại đọc kịp, assist level 1/2 ở từng game, Rê chuột có sao < 3 khi đi sai, Ghép cặp hình–hình, không cuộn ngang ở 899px.
- **Done when:** Ghi kết quả (pass/fail kèm ảnh chụp) vào plan mới (T41).
