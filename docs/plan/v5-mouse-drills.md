# TapGo v5 · Bài chuột nâng cao

Trạng thái: code + docs + review xong, đã commit, còn đo trên trình duyệt thật · mở 2026-10-01

## Mục tiêu

Sau 8 bộ gõ phím nâng cao (v4), thêm 8 bộ đề nâng cao cho chuột, độ khó tăng dần từ bộ 1 đến bộ 8: click nhiều hình → click theo thứ tự → click hình nhỏ → nháy đúp → rê chuột đường dài → kéo nhiều món → kéo phân loại hai nhóm → giữ chuột kéo theo đường.

## Quyết định

- **8 bộ chuột nâng cao là 8 game mới, thêm vào cuối `GAME_IDS` (game 21–28), sau 8 bộ gõ phím** · vì · cùng cách v4 (tiến độ cũ không mất, Lộ trình/Chơi tự do/Tiến độ/sao tự nhận game mới, không đổi schema `tapgo.progress.v1`) · bác bỏ: xen kẽ bộ gõ và bộ chuột trong Lộ trình (đổi thứ tự trạm game 13–20 đã chốt ở v4, bé đang ở giữa bộ gõ sẽ gặp trạm bị khóa) · mở lại nếu: owner muốn bé gặp bài chuột nâng cao sớm hơn trong Lộ trình (Chơi tự do vẫn mở mọi bài).
- **`types.ts`:** `TYPING_DRILL_IDS` (8 id gõ của v4), `MOUSE_DRILL_IDS` (8 id mới), `ADVANCED_GAME_IDS = [...TYPING_DRILL_IDS, ...MOUSE_DRILL_IDS]`; `DRILL_SETS` khóa theo `TypingDrillId`. `getRecommendedGameId` giữ nguyên thứ tự của v4, nên `Chơi ngay` tự đi tiếp sang bộ chuột sau bộ gõ 8.
- **Dữ liệu từng bộ nằm trong `src/games/mouseDrills.ts`; 4 cơ chế dùng chung, mỗi cơ chế một component factory nhận config** · MultiClick (bộ 1–3), DoubleClick (bộ 4), Trail (bộ 5 và 8, tái dùng `MouseTrailGame`), MultiDrag (bộ 6–7, tái dùng `usePointerDrag`).
- **Độ khó nằm ở thứ tự bộ đề, không dùng `level` theo sao** · mỗi bộ 6 lượt (Chơi ngay 5 lượt), kho ≥ 8 mục, xáo theo `sessionSeed`.
- **Mọi bộ mới:** `category: 'mouse'`; sai thì gọi `onRetry(hint)`; xong lượt gọi `onRoundComplete({ correct, attempts })`; mục tiêu kế tiếp mang `data-assist` khi bé sai nhiều; có nút `Nghe yêu cầu` đọc câu có dấu; vừa `.game-stage` ở 1366×768 không cuộn.

## Bộ đề

| # | id | Tên | Cơ chế | Kho | Độ khó |
|---|---|---|---|---|---|
| 1 | `mouse-click-many` | Chuột nâng cao 1 · Click hết các hình | MultiClick | 13 hình (`CLICK_TARGETS`) | 3 hình 96px (`--target-medium`), click hết, thứ tự bất kỳ |
| 2 | `mouse-click-order` | Chuột nâng cao 2 · Click theo số | MultiClick có thứ tự | 13 hình (`CLICK_TARGETS`) | 4 rồi 5 hình 96px (⭐ 🦋 🍎 …) gắn số, xen kẽ theo lượt, click 1 → N; sai số → hint "Click số X trước nhé" |
| 3 | `mouse-click-small` | Chuột nâng cao 3 · Click hình nhỏ | MultiClick | 13 hình (`CLICK_TARGETS`) | 5 hình 56px (`--target-small`), thứ tự bất kỳ |
| 4 | `mouse-double-click` | Chuột nâng cao 4 · Nháy đúp chuột | DoubleClick | 9 đồ vật (`DOUBLE_CLICK_ITEMS`) | 1 mục tiêu 96px; nháy đúp để mở; click đơn → sau 500ms hint "Bấm nhanh hai lần nhé"; click ra ngoài = thử lại |
| 5 | `mouse-trail-long` | Chuột nâng cao 5 · Rê chuột đường dài | Trail | 8 đường (`LONG_TRAILS`) | 9–12 điểm, vùng nhận 68px / chấm 44px (bài cơ bản 104px / 72px) |
| 6 | `mouse-drag-many` | Chuột nâng cao 6 · Kéo nhiều món | MultiDrag | 8 nhóm (`SORT_GROUPS`) | 3 món cùng nhóm kéo vào một chỗ |
| 7 | `mouse-drag-groups` | Chuột nâng cao 7 · Phân loại hai nhóm | MultiDrag | 9 cặp nhóm (`GROUP_PAIRS`) | 4 món trộn (2 + 2), kéo vào đúng một trong hai chỗ |
| 8 | `mouse-hold-trail` | Chuột nâng cao 8 · Giữ chuột kéo theo đường | Trail giữ nút | 12 đường (`TRAILS` của bài cơ bản) | 6–8 điểm, giữ nút trái (`buttons & 1`) từ điểm bắt đầu tới đích; nhả nút giữa đường ở bất kỳ đâu (`pointerup` trên `window`, mỗi lần nhả tính 1 lần sai) → về điểm bắt đầu + hint "Giữ chặt nút chuột nhé" |

Vị trí hình bộ 1–4: lưới 4×2 trong `SAFE_AREA`, xáo theo `sessionSeed`, không chồng nhau, tối đa 8 hình.

## Yêu cầu owner

- REQ-1 · "đang thiếu bài nâng cao cho việc sử dụng chuột"
- REQ-2 · "nhiều bộ đề"
- REQ-3 · "độ khó tăng dần cho trẻ học"
- REQ-4 · "Làm xong nhớ commit source giúp anh nhé"

## Task

- [x] B1 · code: `types.ts`, `registry.ts`, `drills.ts` (khóa `TypingDrillId`), `mouseDrills.ts`, `MultiClickGame.tsx`, `DoubleClickGame.tsx`, `MultiDragGame.tsx`, `MouseTrailGame.tsx` (factory), CSS, test cập nhật + test mới
- [x] B2 · docs: spec `docs/feat/tapgo-mvp.md`, `CHANGELOG.md` `[Unreleased]`, `docs/index.md`, phần Kết quả của file này
- [x] B3 · review độc lập + chạy `npm test` và `npm run build` — không blocker; đã sửa: nhả nút ngoài khung ở bộ 8, timer nháy đúp gọi `onRetry` cũ, câu chữ bộ 2, emoji Unicode 12–13, helper dùng chung
- [x] B4 · commit
- [ ] B5 · đo trên Chrome/Edge thật ở 1366×768: bộ 7 (2 chỗ thả + 4 món, ước ~472px trên ~520px trống), bộ 3 (5 hình 56px) và bộ 5 (đường 12 điểm) nằm trong `.game-stage` không cuộn; vùng nhận 68px của hai điểm liền nhau ở bộ 5 không chạm nhau; nháy đúp (cửa sổ 500ms, `event.detail`) với chuột thật; giữ chuột (`pointerenter` + `buttons`) chạy đúng và `preventDefault` chặn bôi đen; Lộ trình 28 trạm; quan sát thứ tự bộ 4 (nháy đúp) và bộ 5 (rê đường dài) — nếu bé thấy nháy đúp khó hơn thì đổi chỗ hai bộ

## Kết quả

- 2026-10-01 · 8 bộ chuột nâng cao (game 21–28) đã thêm, mỗi bộ 6 lượt; kho và độ khó thực tế như bảng Bộ đề. `MouseTrailGame` thành factory `createMouseTrailGame`, bài cơ bản giữ nguyên hành vi. Token mới trong `theme.css`: `--target-medium` 96px, `--target-small` 56px. Helper dùng chung: `roundSeed` trong `src/game/pickRound.ts`; `joinNames`, `targetSlots`, `MAX_CLICK_TARGETS` trong `src/games/mouseLayout.ts`. Tổng 28 bài, 84 sao.
- Sau review (B3): bộ 2 dùng hình trong kho click gắn số (intro “Hãy click các hình theo số, từ số 1 trở đi.”, `Nghe yêu cầu` “Click các hình theo số, từ số 1 đến số N”); bộ 8 nhả nút ở bất kỳ đâu giữa đường đều về điểm bắt đầu; emoji Unicode 12–13 đã thay: 🪁 cái diều → 🚁 máy bay trực thăng, 🪀 cái yo-yo → 🧩 miếng ghép hình, 🪅 con thú giấy → 🤖 người máy.
- Kiểm tra: `npm test` 39 file / 251 test pass, `npm run build` pass.
- Chưa đo (B5): bố cục và thao tác trên trình duyệt thật — bộ 7 chỉ là ước tính từ CSS (~472px trên ~520px trống, sát), bộ 3 và bộ 5 chưa chụp/đo; nháy đúp và giữ chuột mới chạy trong jsdom.
