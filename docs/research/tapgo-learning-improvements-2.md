# TapGo Learning Improvements 2 · Guided Play v1

## Start time

2026-09-22 (theo tiêu đề amendment gốc "Guided Play v1 sau 8 pass akithink" trong doc tiền nhiệm; giờ bắt đầu chưa verify). Code vào git ở `fa28cb4` (2026-09-30).

## Initial purpose

- **Câu hỏi:** nâng mục tiêu từ "app dễ dùng" thành "bé có thể tự bắt đầu, hiểu việc cần làm, hồi phục sau lỗi và đi tiếp với ít quyết định nhất".
- **Bối cảnh:** pass 1 ([tapgo-learning-improvements.md](tapgo-learning-improvements.md)) đã có retry hint, guide `Xem cách chơi`, lượt ôn, gợi ý phụ huynh, nhưng trẻ vẫn phải tự chọn bài và điều hướng.
- **Ràng buộc:** giữ từ pass 1: không countdown, không failure screen, không backend. Bỏ ràng buộc "không đổi số lượt" của pass 1: Guided Play chạy quick session tối đa 5 lượt (đây là thay đổi Decision khiến doc này tách thành doc kế nhiệm).

## Strategy

8 pass akithink (theo bản gốc; nội dung từng pass không được ghi lại, chưa verify). Hướng thiết kế: giảm số quyết định của trẻ bằng một CTA chính, tự chọn bài, tăng trợ giúp theo số lần sai.

## Checklist

- [x] Home thêm CTA chính `Chơi ngay`; Lộ trình, Chơi tự do và Tiến độ thành lựa chọn phụ.
- [x] `Chơi ngay` chọn bài đầu tiên chưa hoàn thành và chạy quick session tối đa 5 lượt.
- [x] `GameShell` đọc intro khi vào bài; từ lỗi thứ hai tự mở guide và đọc hint cụ thể.
- [x] `assistLevel` tăng dần để làm nổi bật mục tiêu, tăng hit area hoặc snap tolerance ở các game chuột.
- [x] Màn kết quả ưu tiên thông điệp hoàn thành và CTA `Bài tiếp theo`; sao thành tín hiệu phụ.
- [x] Lượt ôn tách khỏi `outcomes` để spaced repetition không đổi scoring của lượt gốc.
- [x] `GAME_IDS` là canonical order; registry và next-game navigation dẫn xuất từ nguồn này.
- [ ] Manual test với bé (xem Verification).

## Result

Guided Play v1 = luồng mặc định Home → `Chơi ngay` → quick session ≤ 5 lượt trên bài được gợi ý → kết quả với `Bài tiếp theo`, có trợ giúp tăng dần sau lỗi (đọc hint, mở guide, `assistLevel` 1–2). Lộ trình và Chơi tự do giữ số lượt đầy đủ.

### Verification

| Claim | Trạng thái tại `fa28cb4` |
| --- | --- |
| CTA `Chơi ngay` | Có: `src/screens/HomeScreen.tsx:17` |
| Chọn bài chưa xong + 5 lượt chỉ cho guided | Có: `src/App.tsx:33, :65`, `src/game/path.ts:12-18`, `src/game/GameShell.tsx:39`. Audit sep30: lượt ôn vẫn chèn thêm nên guided có thể tới 10 lượt (T17) |
| Đọc intro; lỗi thứ 2 mở guide + đọc hint | Có: `GameShell.tsx:43, :85-87`. Audit: điều kiện `>= 2` nên đọc lại ở mọi lỗi sau (T18); hint mất sau ~420ms (T04) |
| `assistLevel` tăng dần | Có: `GameShell.tsx:40` (2 lỗi → 1, 3 lỗi → 2). Audit: chỉ game chuột và PickPicture nhận, hai cơ chế CSS song song (T12); Rê chuột không bao giờ gọi `onRetry` nên assist không chạy (T10) |
| CTA `Bài tiếp theo` | Có: `GameShell.tsx:24`, `App.tsx:69`. Audit: guided dùng bài kế theo thứ tự, không theo gợi ý (T16). "Thông điệp hoàn thành ưu tiên hơn sao" chưa verify bằng mắt |
| Lượt ôn không vào `outcomes` | Có: `GameShell.tsx:47-48` |
| `GAME_IDS` canonical | Có: `src/game/types.ts:3`, `src/game/registry.ts:26`, `path.ts:4, :20-22` |
| Test + build | Audit sep30 trên working tree = `fa28cb4`: tsc sạch, 49/49 test pass, build pass |
| Manual test với bé (người lớn không chỉ tay/đọc hộ; bé tự đi Home → Chơi ngay → hoàn thành → hồi phục sau lỗi → Bài tiếp theo) | Chưa chạy, chưa có artifact ghi kết quả |

### Corroborating links

- Code: commit `fa28cb4` (`feat: add guided play v1 with adaptive hints and visual system`).
- Gap tìm thấy sau đó: [research/audit-full-sep30.md](audit-full-sep30.md) (T04, T10, T12, T16, T17, T18).
- Doc tiền nhiệm: [tapgo-learning-improvements.md](tapgo-learning-improvements.md).

## Decision

- **Action:**
  - Code: `fa28cb4` (G1–G5 trong plan).
  - Spec hiện hành: [feat/tapgo-mvp.md](../feat/tapgo-mvp.md) (§ Product decisions đã chốt, § Game framework contract, § UX rules).
  - Plan: [plan/v2-guided-play.md](../plan/v2-guided-play.md) (Phase 1 G1–G5, Phase 2 G6–G13).
  - Commit sửa các gap trên: `daa76c0` hint giữ tới hết lượt (T04) · `385897d` đọc hint + mở guide chỉ ở lỗi thứ 2 (T18) · `ef5fdfb` copy hint thống nhất (T23) · `d7d14de` guided `Bài tiếp theo` đi tới bài gợi ý (T16) · `714d77a` không sinh lượt ôn trong quick session (T17) · `4c5542b` `data-assist` trên target thật của mọi game (T12) · `558b422` snap kéo thả + `resolveDrop` (T08) · `7575451` Rê chuột tính lỗi sai thứ tự (T10) · `f55c923` gợi ý phụ huynh có nút chơi (T28) · `3831282`, `2ab5801`, `ad488a2` test assist/speech, session length, snap (T34, T37, T36) · `7ed33c3` spec khớp code (T40).
- **Follow-up (chưa xong):** manual QA Chrome/Edge là G16/T44 trong [plan/v2-guided-play.md](../plan/v2-guided-play.md); checklist đó không gồm quan sát bé tự chơi, nên validation với bé vẫn chưa có nơi nhận.
- **Cross-references:** [plan/fix-audit-sep30.md](../plan/fix-audit-sep30.md), [research/audit-full-sep30.md](audit-full-sep30.md).
