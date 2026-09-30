# TapGo Learning Improvements

Status: superseded by docs/research/tapgo-learning-improvements-2.md

## Start time

2026-09-22, implementation pass 1 (ngày lấy từ stamp của bản gốc; giờ bắt đầu chưa verify). Pass 1 không có commit riêng: file và code lần đầu vào git ở `fa28cb4` (2026-09-30), commit này gộp luôn Guided Play v1.

## Initial purpose

- **Câu hỏi:** cải thiện TapGo để trẻ khoảng 6 tuổi học bàn phím và chuột dễ hơn, ít áp lực hơn và nhận được chỉ dẫn hữu ích sau mỗi lỗi.
- **Ràng buộc lúc đó:** không đổi số lượt, scoring, unlock path hoặc localStorage schema; không timer, leaderboard hay failure screen; không cần tài khoản hay backend; hướng dẫn không chặn gameplay để giữ tương thích với luồng hiện tại.

## Strategy

Bản gốc không ghi strategy. Suy ra từ nội dung (chưa verify): đặt trợ giúp ở lớp dùng chung (`GameShell`, `MiniGameProps.onRetry`) thay vì sửa riêng từng game, và giữ nguyên scoring/path/progress để không phá luồng đang chạy.

## Checklist

- [x] Mở rộng `MiniGameProps.onRetry` để nhận hint.
- [x] Thêm hint cụ thể cho game gõ phím và gõ từ.
- [x] Thêm guide panel dùng chung trong `GameShell`.
- [x] Thêm style cho guide và retry hint.
- [x] Thêm ôn lại ngay lượt có lỗi bằng `reviewPending` và `reviewCycle`.
- [x] Tự mở hướng dẫn sau hai lần retry trong cùng lượt.
- [x] Thêm gợi ý bài nên luyện ở màn hình Tiến độ.

## Result

Sáu quyết định triển khai:

1. **Hướng dẫn mở bất cứ lúc nào:** nút `Xem cách chơi` trong `GameShell`, không chặn gameplay. Game bàn phím: nhìn chữ/số lớn và bấm đúng phím. Game chuột: làm theo hình minh họa, thử chậm, không cần vội.
2. **Feedback sau lỗi chỉ dẫn hành động tiếp theo:** `onRetry` nhận hint tùy chọn. Game phím: `Hãy tìm phím X trên bàn phím nhé.` · Game từ: `Hãy tìm chữ X trên màn hình nhé.` · Fallback: `Thử lại nhé, con làm chậm thôi.` Hint dùng `role="status"` cho screen reader.
3. **Ôn lại ngay mục tiêu vừa sai:** lượt có lỗi thì `GameShell` remount cùng mini-game thêm một lần trước khi sang lượt mới; spaced repetition nhẹ, không màn hình phạt, không timer.
4. **Trợ giúp thích nghi:** sai hai lần trong cùng lượt thì guide panel tự mở; hint cụ thể vẫn cập nhật theo mục tiêu hiện tại.
5. **Gợi ý luyện tập cho phụ huynh:** màn Tiến độ chọn bài đầu tiên chưa hoàn thành; nếu đã xong hết thì chọn bài chưa đạt 3 sao. Không cần tài khoản hay backend.
6. **Không countdown:** không timer, leaderboard, failure screen. Accuracy vẫn tính sao, feedback tập trung vào hành động cần thử tiếp.

Tiêu chí nghiệm thu đặt ra:

- Nút `Xem cách chơi` mở/đóng được trong mọi game.
- Sau thao tác sai, trẻ thấy lời nhắc cụ thể, không phải thông báo thất bại.
- Không đổi số lượt, scoring, unlock path hoặc localStorage schema.
- Test suite và production build vẫn pass.

### Verification

Chỉ đối chiếu được trên `fa28cb4`, nơi code pass 1 đã lẫn với Guided Play v1; trạng thái riêng của pass 1 không còn để kiểm.

| Claim | Trạng thái tại `fa28cb4` |
| --- | --- |
| `onRetry(hint?)` | Có: `src/game/types.ts:27` |
| Hint phím / từ / fallback | Có: `src/hooks/useExpectedKey.ts:19`, `src/games/WordTypingGame.tsx:17`, `src/game/GameShell.tsx:30,78,96` |
| Hint `role="status"` | Có: `GameShell.tsx:164` |
| Nút `Xem cách chơi` | Có: `GameShell.tsx:147-150`; "mở/đóng được trong mọi game" chưa verify bằng test hay chạy thật |
| Ôn lại bằng `reviewPending`/`reviewCycle` | Có: `GameShell.tsx:31-32, :177` |
| Guide tự mở sau 2 lần sai | Có, nhưng điều kiện là `>= 2` (`GameShell.tsx:85`) nên mở lại ở mọi lỗi từ lần 2 |
| Gợi ý ở Tiến độ | Có: `src/screens/ProgressScreen.tsx:17,32` dùng `getRecommendedGameId` (`src/game/path.ts:12-18`: chưa xong → chưa 3 sao → bài đầu) |
| Test suite và build pass | Chưa verify cho pass 1. Lần chạy gần nhất có ghi nhận: audit sep30 trên working tree = `fa28cb4`, tsc sạch, 49/49 test pass, build pass |
| Trẻ thấy lời nhắc cụ thể | Bị audit sep30 bác một phần: hint mất sau ~420ms, mất ngay khi reduced-motion (T04); hint game từ bảo tìm "trên màn hình" trong khi phải tìm trên bàn phím (T23) |
| Manual QA với chuột, bàn phím thật, Speech API | Chưa chạy |

### Corroborating links

- Code: commit `fa28cb4` (`feat: add guided play v1 with adaptive hints and visual system`).
- Audit mâu thuẫn với tiêu chí nghiệm thu: [research/audit-full-sep30.md](audit-full-sep30.md) (T04, T18, T23); chi tiết ở [plan/fix-audit-sep30.md](../plan/fix-audit-sep30.md).

## Decision

- **Action:** code trong `fa28cb4`; hành vi hiện hành ghi ở [feat/tapgo-mvp.md](../feat/tapgo-mvp.md) (§ Game framework contract, § UX rules).
- **Follow-up research:** [tapgo-learning-improvements-2.md](tapgo-learning-improvements-2.md): Guided Play v1 đổi Decision của doc này (quick session tối đa 5 lượt phá ràng buộc "không đổi số lượt"; Home chuyển sang một CTA chính).
- **No action (backlog chưa có artifact):** lặp lại mục tiêu hay sai qua nhiều session và lưu weak-skill profile; spaced repetition dài hạn cho phím/từ hay sai; adaptive difficulty nhẹ theo lỗi liên tiếp nhiều buổi; parent progress chi tiết theo kỹ năng. Chưa có plan nào nhận các mục này.
- **Manual QA Chrome/Edge:** chuyển thành T44 trong [plan/fix-audit-sep30.md](../plan/fix-audit-sep30.md) và G16 trong [plan/v2-guided-play.md](../plan/v2-guided-play.md).
- **Cross-references:** [research/audit-full-sep30.md](audit-full-sep30.md).
