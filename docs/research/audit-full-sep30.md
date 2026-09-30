# Audit toàn repo TapGo (sep30)

## Start time

2026-09-30, khoảng 10:40–11:10 (Asia/Bangkok).

## Initial purpose

- **Yêu cầu của owner (nguyên văn):** “Hãy review lại source ở /app/tapgo giúp anh” · “review xong tạo plan và task để dev có thể vào fix dễ dàng”.
- **Phạm vi:** toàn bộ `src/**`, `docs/**`, test, config (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`) và trạng thái git.
- **Baseline:** audit chạy trên working tree lúc đó (guided play v1 chưa commit). Working tree này sau đó được commit nguyên trạng thành `fa28cb4`, nên các finding ứng với commit `fa28cb4`. Version là `0.1.0`, chưa có release hay tag nào.
- **Ràng buộc:** audit chỉ đọc, không sửa file nào. Phần sửa lỗi là một đợt làm riêng (xem Decision).

## Strategy

Dùng akiflow ở dạng `shape=dispatch · mode=audit`: 3 lane subagent chạy song song, mỗi lane có phạm vi file riêng. Mỗi subagent tự đọc bộ rule của lane mình và báo lại receipt `[RULES]`. Lead gộp các finding trùng nhau và kiểm chứng lại những điểm nằm giữa hai lane.

| Lane | Phạm vi | Rule đã đọc (receipt) |
| --- | --- | --- |
| A · flow-core | `src/App.tsx`, `src/main.tsx`, `src/game/**`, `src/hooks/**` | agent, coding, pattern, flow, proportion |
| B · ui-ux | `src/games/**`, `src/components/**`, `src/screens/**`, `src/styles/**`, `index.html` | agent, coding, pattern, ui, ux, content |
| C · docs-tests-build | `docs/**`, `*.test.*`, config, git | agent, coding, pattern, docs, release |

## Checklist

- [x] Nạp rule context (`akidevrule_context`) và đọc spec `docs/feat/tapgo-mvp.md` cùng plan `docs/plan/tapgo-mvp.md`.
- [x] Lane A: 20 file. Lane B: 38 file. Lane C: 34 file đọc và 8 file grep.
- [x] Lane C chạy `npx tsc --noEmit`, `npm test`, `npm run build` trên working tree.
- [x] Lead kiểm lại `src/App.tsx` cho điểm Guided dùng “Bài tiếp theo” (out-of-lane của B).
- [x] Gộp finding trùng thành 44 task (xem plan).

## Result

**Kết luận:** không có P0 (crash hay mất dữ liệu). Logic cốt lõi đúng spec. Có 11 task P1 về gameplay/UX, test và quy trình. Rủi ro quy trình lớn nhất là dependency để `"latest"`, chưa có CHANGELOG, và plan/spec lệch so với code.

### Đã đạt, không có finding

- Chấm sao: 0 attempts cho 1 sao (`scoring.ts:6,10`); bestStars chỉ tăng (`progress.ts:108`).
- Path unlock tuần tự (`path.ts:6-10`); Guided chọn bài đầu tiên chưa xong, sau đó là bài chưa đạt 3 sao (`path.ts:12-18`); quick session 5 lượt chỉ áp dụng cho guided (`App.tsx:65`).
- localStorage: JSON hỏng hoặc exception thì dùng default (`progress.ts:66-83`); `saveProgress` có try/catch.
- Listener keydown được cleanup (`useExpectedKey.ts:24`); drag trả vật về chỗ cũ khi thả sai hoặc cancel.
- Không có chữ “Sai/Thua/Thất bại”; animation dưới 700ms; có `prefers-reduced-motion` và `focus-visible`; desktop gate đúng ở 900px.
- Vị trí mục tiêu Click không bị clip ở khổ 900px; mọi game có nút Home và nút 🔊.
- `dist/` không bị commit; `tsconfig` bật `strict`.

### Findings, gộp theo task

| Task | Pri | Finding | Review IDs |
| --- | --- | --- | --- |
| T01 | P1 | Commit working tree guided play v1 thành 5 commit | C-14 |
| T02 | P2 | Ghim version dependency thay cho "latest" | C-12 |
| T03 | P2 | Tạo CHANGELOG.md với mục [Unreleased] | C-11 |
| T04 | P1 | Lời nhắc "Thử lại" biến mất sau ~420ms (và ngay lập tức khi reduced-motion) | A-1, B-1 |
| T05 | P1 | Nút Home, nghe lại, "Xem cách chơi", "Nghe yêu cầu" nhỏ hơn 72px | B-2 |
| T06 | P1 | Prompt game không nổi bật nhất; Click và Rê chuột không có prompt | B-3 |
| T07 | P1 | Kéo thả: bấm vào vật mà không kéo vẫn bị tính là thả sai | B-5 |
| T08 | P2 | Kéo thả: thả lên ô sai gần ô đúng vẫn được tính là đúng (snap quá rộng) | B-8, C (out-of-lane) |
| T09 | P1 | Rê chuột: thêm điểm bắt đầu, 4–6 checkpoint, và đường vẽ khớp điểm | B-4 |
| T10 | P1 | Rê chuột luôn cho 3 sao và không bao giờ kích hoạt retry/assist | A/B/C (out-of-lane), B-7 |
| T11 | P1 | Ghép cặp: đổi từ hình–chữ sang hình–hình (bóng/màu/nhóm) | B-6 |
| T12 | P1 | Thống nhất cơ chế assist cho mọi game (data-assist) | B-7, C-7 |
| T13 | P2 | loadProgress kiểu được-hết-hoặc-mất-hết: 1 game key lỗi là xoá toàn bộ tiến độ | A-2 |
| T14 | P2 | AudioContext mới cho mỗi tone (có thể leak khi bị suspended) | A-3 |
| T15 | P2 | Speech không cancel khi rời game | A-4 |
| T16 | P2 | Guided: "Bài tiếp theo" nên đi tới bài được gợi ý, không phải bài kế theo thứ tự | B (out-of-lane), lead verified |
| T17 | P3 | Lượt ôn lại làm quick session vượt quá 5 lượt | A-10, B (out-of-lane) |
| T18 | P3 | Hint được đọc lại ở mọi lỗi từ lần thứ 2 trở đi | A-8 |
| T19 | P3 | Drag bắt đầu cả với chuột phải hoặc pointer phụ; thiếu lostpointercapture | A-9, B-20 |
| T20 | P3 | Phím Space bị tính là lỗi và kích hoạt nút đang được focus | B-19 |
| T21 | P3 | saveProgress (side effect) chạy trong updater của setProgress | A-6 |
| T22 | P3 | Xoá nhánh "game definition thiếu" không thể xảy ra | A-7, C-7 |
| T23 | P2 | Chuẩn hoá copy lỗi "Thử lại nhé!" và sửa hint sai ngữ cảnh | B-9 |
| T24 | P2 | Dữ liệu vòng chơi: Chuỗi dài 3–5 ký tự, FindKey khác bộ Letters | B-10 |
| T25 | P2 | Mỗi game có nút "Nghe yêu cầu" đọc prompt của lượt; đổi tên nút ở header | B-16 |
| T26 | P2 | Game Từ/Chuỗi đánh dấu ký tự đã gõ xong | B-17 |
| T27 | P2 | GameCard và aria: nút ghi "Chơi", bài khoá nói cách mở, aria-label có role | B-14 |
| T28 | P2 | Màn Tiến độ: thêm nút làm theo gợi ý, dùng StarRating | B-15 |
| T29 | P2 | Desktop gate dưới 900px bị cuộn ngang | B-13 |
| T30 | P3 | Click mục tiêu: xáo vị trí mỗi session (spec ghi "ngẫu nhiên an toàn") | B-21 |
| T31 | P2 | Gom logic lặp: useKeySequence, ListenButton, resolveDrop, stage chung cho game phím | B-11 |
| T32 | P2 | Design token là nguồn duy nhất (radius, font, motion) | B-12 |
| T33 | P2 | Xoá code và CSS chết | B-18 |
| T34 | P1 | Test assistLevel 0/1/2, đọc intro, đọc hint ở GameShell và game chuột | C-1 |
| T35 | P2 | Test thao tác sai cho FindKey, NumberKey (MouseTrail theo T10) | C-2 |
| T36 | P2 | Test kéo thả: nhánh snap/assist và pointer cancel | C-3 |
| T37 | P2 | Test path fallback, localStorage throw, guided 1/5 vs Path 1/10 | A-5, C-4, C-5 |
| T38 | P2 | app.test.ts: bỏ node:fs và @ts-expect-error, dùng ?raw | C-13 |
| T39 | P3 | Vitest: giảm thời gian dựng jsdom (69% thời gian test) | C-15 |
| T40 | P2 | Đồng bộ spec với code (Testing strategy, assist, ProgressScreen, Error handling) | C-6, C-7 |
| T41 | P2 | Plan mới docs/plan/v2-guided-play.md; plan cũ giữ Step 6–8 | C-8 |
| T42 | P2 | Research doc: đúng schema B2, tách doc kế nhiệm, thêm vào index | C-9 |
| T43 | P3 | Stamp `updated` dùng commit hash hoặc semver | C-10 |
| T44 | P1 | Manual QA trên Chrome/Edge desktop (Step 6 của plan cũ) | Plan Step 6 |

Chi tiết từng task (Where, Evidence, Fix, Done when) nằm trong [plan/fix-audit-sep30.md](../plan/fix-audit-sep30.md).

### Verification

- **Đã chạy thật** (2026-09-30 ~11:01, lane C): `npx tsc --noEmit` không có lỗi. `npm test` (vitest 5.0.0) cho **19 file, 49 test pass, 0 fail**; jsdom dựng 19 lần, mất 13.64s. `npm run build` (vite 8.3.0) ra 46 module, JS 245.14 kB (gzip 76.05 kB).
- **Kiểm bằng đọc code:** mọi finding đều ghi `file:line` và đánh dấu FACT hoặc ASSUMPTION ngay trên finding đó.
- **Chưa kiểm chứng, cần chạy runtime:** cuộn ngang ở màn desktop gate (T29), AudioContext leak khi bị suspended (T14), chuột phải làm vật kẹt khi kéo (T19). Manual QA trên Chrome/Edge chưa chạy (T44).

### Corroborating links

- Spec: [feat/tapgo-mvp.md](../feat/tapgo-mvp.md) · Plan MVP: [plan/tapgo-mvp.md](../plan/tapgo-mvp.md) · Research guided play: [research/tapgo-learning-improvements.md](tapgo-learning-improvements.md)
- Theo dõi task: Notion “TapGo — Review & Fix Plan (2026-09-30)” (https://app.notion.com/p/185c1dc1605441f98e2198f45726880e)

## Decision

- **Action:** [plan/fix-audit-sep30.md](../plan/fix-audit-sep30.md), 44 task chia 7 phase. T01 (commit baseline) đã xong ở `fa28cb4`.
- **Cross-references:** `docs/feat/tapgo-mvp.md` (cập nhật trong T40), `docs/plan/tapgo-mvp.md` (Step 6–8 chuyển thành T44 và T41), `docs/research/tapgo-learning-improvements.md` (T42).