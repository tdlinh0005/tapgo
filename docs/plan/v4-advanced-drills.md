# TapGo v4 · Bài nâng cao sau lộ trình cơ bản

Trạng thái: code + docs xong, còn đo trên trình duyệt thật · mở 2026-10-01

## Mục tiêu

Bé xong 12 bài cơ bản thì `Chơi ngay` và Lộ trình tiếp tục đưa bé sang các bộ đề gõ phím nâng cao, độ khó tăng dần từ bộ 1 đến bộ 8.

## Quyết định

- **8 bộ đề nâng cao là 8 game mới, thêm vào cuối `GAME_IDS` (game 13–20)** · vì · cùng cách phase D đã làm (tiến độ cũ không mất, bé xong 12 bài thì mở luôn bài 13), Lộ trình/Chơi tự do/Tiến độ/sao tự nhận game mới · bác bỏ: một track nâng cao riêng có progress riêng (đổi schema `tapgo.progress.v1`, thêm màn hình); thêm level 3–4 vào game cũ (bé không thấy được bài mới, không có "bộ đề") · mở lại nếu: lộ trình 20 trạm quá dài trên 1366×768.
- **Một component dùng chung `TypingDrillGame`, dữ liệu từng bộ nằm trong `src/games/drills.ts`** · vì · 8 bộ cùng luật (gõ chuỗi theo thứ tự, có thể có phím cách / Enter), chỉ khác kho đề.
- **`Chơi ngay` ưu tiên bài nâng cao sau khi xong cơ bản** · thứ tự: bài đầu tiên chưa hoàn thành (cơ bản trước, rồi nâng cao 1→8) → bài nâng cao đầu tiên chưa đạt 3 sao → bài bất kỳ đầu tiên chưa đạt 3 sao → bộ nâng cao đầu tiên · vì · owner muốn "xong tutorial sẽ lựa chọn mấy bài nâng cao hơn để luyện tập".
- **Độ khó nằm ở thứ tự bộ đề, không dùng `level` theo sao** · mỗi bộ một kho cố định; độ dài chuỗi dài nhất tăng dần theo bộ.
- Hiển thị phím cách là `␣`, Enter là `⏎` trong chuỗi; câu dùng chữ in hoa không dấu như game `Gõ từ ngắn`, nút `Nghe yêu cầu` đọc bản có dấu.

## Bộ đề

| # | id | Tên | Nội dung | Độ dài |
|---|---|---|---|---|
| 1 | `drill-home-row` | Nâng cao 1 · Hàng phím giữa | chỉ A S D F G H J K L | 4–5 |
| 2 | `drill-top-row` | Nâng cao 2 · Hàng phím trên | chỉ Q W E R T Y U I O P | 4–5 |
| 3 | `drill-bottom-row` | Nâng cao 3 · Hàng phím dưới | chỉ Z X C V B N M | 4–5 |
| 4 | `drill-long-words` | Nâng cao 4 · Từ dài | từ 4–6 chữ có hình | 4–6 |
| 5 | `drill-two-words` | Nâng cao 5 · Hai từ | 2 từ, có phím cách | 5–8 |
| 6 | `drill-numbers` | Nâng cao 6 · Số và chữ | số + từ, có phím cách | 5–9 |
| 7 | `drill-sentences` | Nâng cao 7 · Câu ngắn | 3 từ | 8–11 |
| 8 | `drill-sentence-enter` | Nâng cao 8 · Câu dài và Enter | 3–4 từ, kết thúc bằng Enter | 10–14 |

Mỗi bộ 6 lượt (Chơi ngay 5 lượt), kho ≥ 10 mục, xáo theo `sessionSeed`.

## Yêu cầu owner

- REQ-1 · "flow tập gõ cho bé theo turtorial có vẻ okie rồi" — giữ nguyên `Chơi ngay` cho 12 bài cơ bản
- REQ-2 · "Anh muốn thêm bài nâng cao"
- REQ-3 · "xong turtorial sẽ lựa chọn mấy bài nâng cao hơn để luyện tập"
- REQ-4 · "nhiều bộ đề và độ khó tăng dần cho trẻ học"
- REQ-5 · "Làm xong nhớ commit source giúp anh nhé"

## Task

- [x] A1 · code: `drills.ts`, `TypingDrillGame.tsx`, `types.ts` (`BASIC_GAME_IDS`/`ADVANCED_GAME_IDS`), `registry.ts`, `path.ts`, test cập nhật + test mới
- [x] A2 · docs: spec `docs/feat/tapgo-mvp.md`, `CHANGELOG.md` `[Unreleased]`, `docs/index.md`
- [x] A3 · review + chạy `npm test` và `npm run build`
- [x] A4 · commit
- [ ] A5 · đo trên Chrome/Edge thật ở 1366×768 và 1280×720: câu 11–14 phím (`data-size="compact"`) nằm trên một hàng và `.game-stage` không cuộn; Lộ trình 20 trạm (4 hàng); giọng `vi-VN` đọc câu có dấu

## Kết quả

- 2026-10-01 · 8 bộ đề (game 13–20) đã thêm, 11–12 mục/bộ, 6 lượt; độ dài thực tế 4–5, 4–5, 4–5, 4–6, 5–8, 5–9, 9–11, 10–14. `getRecommendedGameId` theo thứ tự ở phần Quyết định. `spokenKeyName` gộp tên phím cách / Enter cho hint (SpaceEnterGame dùng chung). Câu từ 11 phím dùng ô nhỏ (64×80px, gap `--space-sm`) để không xuống hàng.
- Bộ 3 (hàng dưới không có nguyên âm) chỉ gồm chuỗi chữ, đọc từng chữ; bộ 1–2 trộn âm tiết thật (`HAHA`, `SALAD`, `QUET`, `TUOI`, `TRUOT`).
- Kiểm tra: `npm test` 35 file / 206 test pass, `npm run build` (tsc + vite) pass.
- Chưa đo (A5): bố cục thật trên trình duyệt — ước tính từ CSS: 14 ô compact ≈ 1.200px, vừa vùng chơi 1366px nhưng chưa chụp/đo.
