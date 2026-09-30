# TapGo v2 · Guided Play Plan

**Goal:** Gom toàn bộ việc guided play (Chơi ngay, quick session, retry hint, assist, lượt ôn, gợi ý phụ huynh) vào một plan, để không còn việc guided nằm ngoài plan.

**Spec:** `docs/feat/tapgo-mvp.md` · **Research:** `docs/research/tapgo-learning-improvements-2.md` · **Fix chi tiết:** `docs/plan/fix-audit-sep30.md`

Plan MVP cũ đã đóng và nằm ở `docs/plan/done/tapgo-mvp.md` (G19); không chứa việc guided. Manual QA còn lại của nó (Step 6) được theo dõi ở G16 (T44).

## Global constraints

- Không countdown; Guided Play tối đa 5 lượt, Lộ trình/Chơi tự do giữ số lượt đầy đủ.
- Mini-game không đọc/ghi localStorage và không tự điều hướng; `GameShell` giữ retry count và `assistLevel`.
- Mỗi thay đổi hành vi có test Vitest; `npm test` và `npm run build` phải pass trước khi commit.

## Phase 1 · Guided play v1 (đã làm)

- [x] **G1 · Quick session:** `Chơi ngay` mở bài đầu tiên chưa hoàn thành (`getRecommendedGameId`), `roundLimit` 5, CTA `Bài tiếp theo`. Commit `fa28cb4`.
- [x] **G2 · Retry hint + assist:** game báo lỗi qua `onRetry(hint)`; shell đọc hint, mở guide, truyền `assistLevel`. Commit `fa28cb4`.
- [x] **G3 · Lượt ôn:** lượt có lỗi được chơi lại một lần, không đổi scoring. Commit `fa28cb4`.
- [x] **G4 · Gợi ý phụ huynh:** Progress có khối `Gợi ý cho bố mẹ`. Commit `fa28cb4`.
- [x] **G5 · Visual system:** chữ lớn, nút 72 px, animation ngắn, reduced-motion. Commit `fa28cb4`.

## Phase 2 · Fix sau audit sep30 (đã làm)

Chi tiết từng task nằm trong `docs/plan/fix-audit-sep30.md`.

- [x] **G6 · Hint và guide:** hint giữ tới khi xong lượt (T04), đọc hint + mở guide ở lần sai thứ 2 (T18), copy hint thống nhất (T23). Commits `daa76c0`, `385897d`, `ef5fdfb`.
- [x] **G7 · Guided next và quick session:** `Bài tiếp theo` đi tới bài được gợi ý (T16), không sinh lượt ôn trong quick session (T17). Commits `d7d14de`, `714d77a`.
- [x] **G8 · Assist thống nhất:** `data-assist="1|2"` trên target thật của cả 10 game (T12); snap kéo thả 24 px + 16 px/level (T08). Commits `4c5542b`, `558b422`.
- [x] **G9 · Nghe và prompt:** `Nghe yêu cầu` ở mọi game, header `Nghe lại cách chơi` (T25); prompt lớn nhất, click/rê chuột có prompt (T06); nút 72 px (T05). Commits `397a47b`, `a476f0e`, `c706384`.
- [x] **G10 · Rê chuột tính lỗi sai thứ tự** để retry/assist hoạt động (T10), thêm điểm bắt đầu và checkpoint (T09). Commits `7575451`, `4f96cbc`.
- [x] **G11 · Gợi ý phụ huynh có nút `Chơi <bài>` và `StarRating`** (T28). Commit `f55c923`.
- [x] **G12 · Test pin hành vi guided:** assist 0/1/2 và speech intro/hint (T34), path fallback và session length (T37), snap + pointer cancel (T36). Commits `3831282`, `2ab5801`, `ad488a2`.
- [x] **G13 · Spec khớp code** (T40). Commit `7ed33c3`.

## Phase 3 · Docs, QA và bug từ QA

- [x] **G14 · Research doc đúng schema B2 + doc kế nhiệm** (T42). Commit `835b9be`.
- [x] **G15 · Stamp `updated` dùng commit hash** (T43). Commit `61484e8`.
- [ ] **G16 · Manual QA trên Chrome/Edge desktop** (T44). Lượt 1 (Chromium headless) đã chạy, còn lượt người chạy trên Chrome/Edge thật; kết quả ghi ở mục [Kết quả QA](#kết-quả-qa-g16--t44). Checklist gồm Step 6 của plan cũ cộng thêm:
  - `Chơi ngay` mở bài gợi ý; session dừng ở 5 lượt và không có lượt ôn.
  - Sai 2 lần: guide mở, hint được đọc, target có viền; sai 3 lần: target phóng to.
  - `Nghe yêu cầu` đọc đúng mục tiêu lượt; `Nghe lại cách chơi` đọc intro.
  - `Bài tiếp theo` trong Guided đi tới bài gợi ý, không lặp bài vừa chơi.
  - Progress: nút `Chơi <bài>` mở đúng bài.
- [x] **G17 · Rê chuột không tính lỗi trước khi chạm điểm bắt đầu 🟢:** mở game bằng chuột không bị tính sai ngay (T45), quay chuột về 🟢 của lượt mới không bị tính sai (T46). Commit `45c3d55`.
- [x] **G18 · Vùng chơi Rê chuột / Click mục tiêu vừa màn hình laptop** (T47): ở 1366×768 đáy `.trail-area` và `.click-play-area` ≤ `innerHeight`; nút `Nghe yêu cầu` không kéo hết chiều ngang. Commit `b298a59`; cần đo lại trên Chrome/Edge thật trong G16.
- [x] **G19 · Đóng plan:** chuyển `docs/plan/tapgo-mvp.md` sang `docs/plan/done/` và cập nhật `docs/index.md`. Làm 2026-09-30 theo yêu cầu owner, trước khi G16 pass; G16 vẫn mở.

## Kết quả QA (G16 / T44)

Bảng chi tiết từng mục: [fix-audit-sep30.md § Kết quả lượt 1](fix-audit-sep30.md#kết-quả-lượt-1--2026-09-30--chromium-headless-playwright).

| Lượt | Ngày | Môi trường | Kết quả |
| --- | --- | --- | --- |
| 1 | 2026-09-30 | Chromium headless (Playwright), build `dist/` của `7ed33c3`, input giả lập, spy `speechSynthesis.speak` | 21 mục: 17 PASS, 2 PASS có điều kiện (Rê chuột chỉ xong khi vùng chơi nằm trọn trong màn hình; giọng đọc mới kiểm lời gọi, chưa nghe thật), 2 FAIL → G17 (đã sửa), G18. Ảnh chụp chưa đưa vào repo. |
| 2 | — | Chrome và Edge thật, chuột và bàn phím thật | Chưa chạy. Cần: nghe giọng đọc tiếng Việt, quan sát bé tự chơi (Home → Chơi ngay → hồi phục sau lỗi → Bài tiếp theo), kiểm lại G17–G18, ghi pass/fail kèm ảnh chụp vào bảng này. |
